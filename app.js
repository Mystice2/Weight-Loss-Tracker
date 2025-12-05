// ===========================
// PWA SERVICE WORKER REGISTRATION
// ===========================

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then(reg => console.log('Service Worker registered:', reg))
            .catch(err => console.log('Service Worker registration failed:', err));
    });
}

// ===========================
// TAB SWITCHING
// ===========================

function switchTab(tabName) {
    // Hide all tabs
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.classList.remove('active'));

    // Remove active from all buttons
    const btns = document.querySelectorAll('.tab-btn');
    btns.forEach(btn => btn.classList.remove('active'));

    // Show selected tab
    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===========================
// DATA MANAGEMENT
// ===========================

function loadData() {
    const data = localStorage.getItem('japanCutData');
    if (data) {
        return JSON.parse(data);
    }
    return {
        settings: {
            startWeight: 260,
            goalWeight: 200,
            startDate: new Date().toISOString().split('T')[0],
            goalDate: '2025-05-15',
            calorieTarget: 1750,
            proteinTarget: 180,
            stepTarget: 12000
        },
        entries: [],
        meals: [],
        dailyMeals: {}
    };
}

function saveData(data) {
    localStorage.setItem('japanCutData', JSON.stringify(data));
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// ===========================
// SETTINGS MANAGEMENT
// ===========================

function loadSettings() {
    const data = loadData();
    const s = data.settings;

    document.getElementById('startWeight').value = s.startWeight;
    document.getElementById('goalWeight').value = s.goalWeight;
    document.getElementById('startDate').value = s.startDate;
    document.getElementById('goalDate').value = s.goalDate;
    document.getElementById('calorieTarget').value = s.calorieTarget;
    document.getElementById('proteinTarget').value = s.proteinTarget;
    document.getElementById('stepTarget').value = s.stepTarget;
}

function savePlanSettings() {
    const data = loadData();

    data.settings = {
        startWeight: parseFloat(document.getElementById('startWeight').value),
        goalWeight: parseFloat(document.getElementById('goalWeight').value),
        startDate: document.getElementById('startDate').value,
        goalDate: document.getElementById('goalDate').value,
        calorieTarget: parseInt(document.getElementById('calorieTarget').value),
        proteinTarget: parseInt(document.getElementById('proteinTarget').value),
        stepTarget: parseInt(document.getElementById('stepTarget').value)
    };

    saveData(data);
    showToast('Settings saved! 💾');
    updateDashboard();
}

function resetAllData() {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone.')) {
        localStorage.removeItem('japanCutData');
        showToast('All data reset! 🗑️');
        setTimeout(() => location.reload(), 1000);
    }
}

// ===========================
// DAILY LOG MANAGEMENT
// ===========================

function saveLog() {
    const data = loadData();
    const date = document.getElementById('logDate').value;
    const weight = parseFloat(document.getElementById('logWeight').value);
    const calories = parseInt(document.getElementById('logCalories').value);
    const protein = parseInt(document.getElementById('logProtein').value);
    const steps = parseInt(document.getElementById('logSteps').value);
    const workout = document.getElementById('logWorkout').value === 'true';

    if (!date || !weight) {
        alert('Please enter at least a date and weight!');
        return;
    }

    const existingIndex = data.entries.findIndex(e => e.date === date);

    const entry = {
        date,
        weight,
        calories: calories || 0,
        protein: protein || 0,
        steps: steps || 0,
        workout
    };

    if (existingIndex >= 0) {
        data.entries[existingIndex] = entry;
    } else {
        data.entries.push(entry);
    }

    data.entries.sort((a, b) => new Date(a.date) - new Date(b.date));

    saveData(data);
    showToast('Log saved! 💪');

    // Clear form
    document.getElementById('logCalories').value = '';
    document.getElementById('logProtein').value = '';
    document.getElementById('logSteps').value = '';
    document.getElementById('logWorkout').value = 'false';

    updateDashboard();
    updateHistoryTable();
    drawChart();
}

function updateHistoryTable() {
    const data = loadData();
    const tbody = document.getElementById('historyBody');

    if (data.entries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">No logs yet</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    // Show last 10 entries
    const recentEntries = data.entries.slice(-10);

    recentEntries.forEach(entry => {
        const change = (data.settings.startWeight - entry.weight).toFixed(1);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td><strong>${entry.weight}</strong> lb</td>
            <td style="color: ${change >= 0 ? '#86efac' : '#fca5a5'}">${change >= 0 ? '-' : '+'}${Math.abs(change)}</td>
            <td>${entry.calories || '--'}</td>
            <td>${entry.protein || '--'}g</td>
            <td>${entry.steps ? entry.steps.toLocaleString() : '--'}</td>
            <td><span class="badge ${entry.workout ? 'yes' : 'no'}">${entry.workout ? '✓' : '✗'}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function formatDate(dateStr) {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ===========================
// DASHBOARD / PROGRESS
// ===========================

function updateDashboard() {
    const data = loadData();
    const settings = data.settings;
    const entries = data.entries;

    let currentWeight = settings.startWeight;
    if (entries.length > 0) {
        currentWeight = entries[entries.length - 1].weight;
    }
    document.getElementById('currentWeight').textContent = currentWeight.toFixed(1);

    const totalLost = settings.startWeight - currentWeight;
    document.getElementById('totalLost').textContent = totalLost.toFixed(1);

    const today = new Date();
    const goalDate = new Date(settings.goalDate + 'T00:00:00');
    const daysUntilGoal = Math.max(0, Math.ceil((goalDate - today) / (1000 * 60 * 60 * 24)));
    document.getElementById('daysUntilGoal').textContent = daysUntilGoal;

    const remainingLoss = currentWeight - settings.goalWeight;
    const weeksRemaining = daysUntilGoal / 7;
    const neededLossPerWeek = weeksRemaining > 0 ? (remainingLoss / weeksRemaining) : 0;
    document.getElementById('neededLossPerWeek').textContent = neededLossPerWeek > 0 ? neededLossPerWeek.toFixed(1) : '--';

    let avgLossPerWeek = 0;
    if (entries.length >= 2) {
        const firstEntry = entries[0];
        const lastEntry = entries[entries.length - 1];
        const firstDate = new Date(firstEntry.date + 'T00:00:00');
        const lastDate = new Date(lastEntry.date + 'T00:00:00');
        const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
        const weeksDiff = daysDiff / 7;
        if (weeksDiff > 0) {
            avgLossPerWeek = (firstEntry.weight - lastEntry.weight) / weeksDiff;
        }
    }
    document.getElementById('avgLossPerWeek').textContent = avgLossPerWeek > 0 ? avgLossPerWeek.toFixed(1) : '--';

    let projectedWeight = currentWeight;
    if (avgLossPerWeek > 0 && daysUntilGoal > 0) {
        projectedWeight = currentWeight - (avgLossPerWeek * weeksRemaining);
    }
    document.getElementById('projectedWeight').textContent = avgLossPerWeek > 0 ? projectedWeight.toFixed(1) : '--';

    const statusMsg = document.getElementById('statusMessage');
    if (entries.length === 0) {
        statusMsg.className = 'status-message';
        statusMsg.textContent = 'Start logging your daily progress to see your stats!';
    } else if (projectedWeight <= settings.goalWeight) {
        statusMsg.className = 'status-message success';
        statusMsg.textContent = `🎉 You're on track! Projected to reach ${settings.goalWeight} lb by goal date. Keep crushing it!`;
    } else if (projectedWeight <= settings.goalWeight + 5) {
        statusMsg.className = 'status-message warning';
        statusMsg.textContent = `⚠️ Slightly behind pace. Tighten up your nutrition or add more activity to stay on track.`;
    } else {
        statusMsg.className = 'status-message warning';
        statusMsg.textContent = `⚠️ Behind pace. Current projection: ${projectedWeight.toFixed(1)} lb at goal date. Need ${neededLossPerWeek.toFixed(1)} lb/week.`;
    }

    document.getElementById('targetCalories').textContent = settings.calorieTarget;
    document.getElementById('targetProtein').textContent = settings.proteinTarget;
}

// ===========================
// MEAL MANAGEMENT
// ===========================

function addMeal() {
    const name = document.getElementById('mealName').value.trim();
    const calories = parseInt(document.getElementById('mealCalories').value);
    const protein = parseInt(document.getElementById('mealProtein').value);
    const notes = document.getElementById('mealNotes').value.trim();

    if (!name || !calories || !protein) {
        alert('Please enter meal name, calories, and protein!');
        return;
    }

    const data = loadData();
    const meal = {
        id: Date.now().toString(),
        name,
        calories,
        protein,
        notes
    };

    data.meals.push(meal);
    saveData(data);
    showToast('Meal added! 🍱');

    document.getElementById('mealName').value = '';
    document.getElementById('mealCalories').value = '';
    document.getElementById('mealProtein').value = '';
    document.getElementById('mealNotes').value = '';

    updateMealLibrary();
    updateMealSelect();
}

function deleteMeal(mealId) {
    if (!confirm('Delete this meal?')) return;

    const data = loadData();
    data.meals = data.meals.filter(m => m.id !== mealId);

    Object.keys(data.dailyMeals).forEach(date => {
        data.dailyMeals[date] = data.dailyMeals[date].filter(id => id !== mealId);
    });

    saveData(data);
    showToast('Meal deleted! 🗑️');
    updateMealLibrary();
    updateMealSelect();
    updateDailyMeals();
}

function updateMealLibrary() {
    const data = loadData();
    const container = document.getElementById('mealLibrary');

    if (data.meals.length === 0) {
        container.innerHTML = '<div class="empty-state">No meals saved yet</div>';
        return;
    }

    container.innerHTML = '';
    data.meals.forEach(meal => {
        const div = document.createElement('div');
        div.className = 'meal-item';
        div.innerHTML = `
            <div class="meal-info">
                <div class="meal-name">${meal.name}</div>
                <div class="meal-stats">${meal.calories} cal • ${meal.protein}g protein${meal.notes ? ' • ' + meal.notes : ''}</div>
            </div>
            <div class="meal-actions">
                <button class="btn-icon" onclick="deleteMeal('${meal.id}')" title="Delete">🗑</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function updateMealSelect() {
    const data = loadData();
    const select = document.getElementById('mealSelect');

    select.innerHTML = '<option value="">Select a meal...</option>';
    data.meals.forEach(meal => {
        const option = document.createElement('option');
        option.value = meal.id;
        option.textContent = `${meal.name} (${meal.calories} cal, ${meal.protein}g)`;
        select.appendChild(option);
    });
}

function addMealToDay() {
    const mealId = document.getElementById('mealSelect').value;
    if (!mealId) {
        alert('Please select a meal!');
        return;
    }

    const date = document.getElementById('logDate').value;
    if (!date) {
        alert('Please select a date in the Log tab first!');
        return;
    }

    const data = loadData();
    if (!data.dailyMeals[date]) {
        data.dailyMeals[date] = [];
    }

    data.dailyMeals[date].push(mealId);
    saveData(data);
    showToast('Meal added to plan! 📅');

    document.getElementById('mealSelect').value = '';
    updateDailyMeals();
}

function removeMealFromDay(date, index) {
    const data = loadData();
    data.dailyMeals[date].splice(index, 1);

    if (data.dailyMeals[date].length === 0) {
        delete data.dailyMeals[date];
    }

    saveData(data);
    showToast('Meal removed! 🗑️');
    updateDailyMeals();
}

function updateDailyMeals() {
    const data = loadData();
    const date = document.getElementById('logDate').value;
    const container = document.getElementById('dailyMeals');
    const summary = document.getElementById('dailyMealSummary');

    if (!date || !data.dailyMeals[date] || data.dailyMeals[date].length === 0) {
        container.innerHTML = '<div class="empty-state">No meals planned</div>';
        summary.style.display = 'none';
        return;
    }

    container.innerHTML = '';
    let totalCalories = 0;
    let totalProtein = 0;

    data.dailyMeals[date].forEach((mealId, index) => {
        const meal = data.meals.find(m => m.id === mealId);
        if (!meal) return;

        totalCalories += meal.calories;
        totalProtein += meal.protein;

        const div = document.createElement('div');
        div.className = 'meal-item';
        div.innerHTML = `
            <div class="meal-info">
                <div class="meal-name">${meal.name}</div>
                <div class="meal-stats">${meal.calories} cal • ${meal.protein}g protein</div>
            </div>
            <div class="meal-actions">
                <button class="btn-icon" onclick="removeMealFromDay('${date}', ${index})" title="Remove">🗑</button>
            </div>
        `;
        container.appendChild(div);
    });

    document.getElementById('dailyTotalCalories').textContent = totalCalories;
    document.getElementById('dailyTotalProtein').textContent = totalProtein;
    summary.style.display = 'block';

    if (!document.getElementById('logCalories').value) {
        document.getElementById('logCalories').value = totalCalories;
    }
    if (!document.getElementById('logProtein').value) {
        document.getElementById('logProtein').value = totalProtein;
    }
}

// ===========================
// PRE-BUILT MEAL PLANS
// ===========================

function getMealPlan() {
    return [
        {
            day: 'Monday',
            workout: true,
            meals: {
                breakfast: '4 whole eggs scrambled, 2 slices whole wheat toast, 1 banana',
                lunch: '8 oz grilled chicken breast, 1.5 cups white rice, 1 cup steamed broccoli',
                dinner: '8 oz lean ground turkey, 1 cup sweet potato, mixed green salad',
                snacks: '1 cup Greek yogurt (0% fat), 1 scoop whey protein shake, 1 apple'
            },
            calories: 1780,
            protein: 185
        },
        {
            day: 'Tuesday',
            workout: false,
            meals: {
                breakfast: '1 cup oatmeal with 1 scoop protein powder, 10 almonds',
                lunch: '8 oz baked chicken thighs, 1 cup jasmine rice, 1 cup roasted bell peppers',
                dinner: '8 oz tilapia, 6 oz sweet potato, 2 cups steamed spinach',
                snacks: '2 hard boiled eggs, 1 protein shake, 1 orange'
            },
            calories: 1690,
            protein: 178
        },
        {
            day: 'Wednesday',
            workout: true,
            meals: {
                breakfast: '3 whole eggs + 3 egg whites omelet, 1 cup mixed berries',
                lunch: '8 oz lean beef (93/7), 1.5 cups white rice, 1 cup green beans',
                dinner: '8 oz grilled chicken, 1 cup quinoa, caesar salad (light dressing)',
                snacks: '1 cup cottage cheese (low fat), 1 protein shake, 1 banana'
            },
            calories: 1820,
            protein: 195
        },
        {
            day: 'Thursday',
            workout: false,
            meals: {
                breakfast: '4 turkey sausage links, 2 whole grain waffles, sugar-free syrup',
                lunch: '8 oz pork tenderloin, 1 cup basmati rice, 1 cup steamed carrots',
                dinner: '8 oz shrimp, 1 large sweet potato, asparagus',
                snacks: '1 cup Greek yogurt, 1 scoop whey protein, handful of grapes'
            },
            calories: 1720,
            protein: 182
        },
        {
            day: 'Friday',
            workout: true,
            meals: {
                breakfast: '4 whole eggs, 2 turkey bacon slices, 1 slice whole wheat toast',
                lunch: '8 oz grilled salmon, 1.5 cups wild rice, roasted brussels sprouts',
                dinner: '8 oz chicken breast, 1 cup pasta (whole wheat), marinara sauce, side salad',
                snacks: '2 string cheese, 1 protein shake with almond milk, 1 apple'
            },
            calories: 1790,
            protein: 188
        },
        {
            day: 'Saturday',
            workout: false,
            meals: {
                breakfast: '1 cup Greek yogurt with granola and berries, 2 boiled eggs',
                lunch: '8 oz ground turkey (93/7), 1 cup brown rice, stir-fry vegetables',
                dinner: '8 oz sirloin steak, 6 oz red potato, grilled zucchini',
                snacks: '1 protein shake, 1 banana, 15 almonds'
            },
            calories: 1740,
            protein: 180
        },
        {
            day: 'Sunday',
            workout: false,
            meals: {
                breakfast: 'Protein pancakes (1 scoop powder, 2 eggs, oats), sugar-free syrup',
                lunch: '8 oz chicken breast, 1.5 cups white rice, 1 cup broccoli',
                dinner: '8 oz cod, 1 cup couscous, roasted cauliflower',
                snacks: '1 cup cottage cheese, 1 protein shake, mixed berries'
            },
            calories: 1680,
            protein: 175
        }
    ];
}

function renderMealPlan() {
    const mealPlan = getMealPlan();
    const container = document.getElementById('mealPlanGrid');
    container.innerHTML = '';

    mealPlan.forEach((day, index) => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <div class="day-header">
                <div class="day-name">${day.day}</div>
                ${day.workout ? '<div class="day-workout">💪 Workout</div>' : ''}
            </div>
            <div class="meal-section">
                <div class="meal-label">Breakfast</div>
                <div class="meal-content">${day.meals.breakfast}</div>
            </div>
            <div class="meal-section">
                <div class="meal-label">Lunch</div>
                <div class="meal-content">${day.meals.lunch}</div>
            </div>
            <div class="meal-section">
                <div class="meal-label">Dinner</div>
                <div class="meal-content">${day.meals.dinner}</div>
            </div>
            <div class="meal-section">
                <div class="meal-label">Snacks</div>
                <div class="meal-content">${day.meals.snacks}</div>
            </div>
            <div class="day-totals">
                <div class="day-total-item">
                    <strong>${day.calories}</strong> cal
                </div>
                <div class="day-total-item">
                    <strong>${day.protein}g</strong> protein
                </div>
            </div>
            <div class="day-actions">
                <button class="btn btn-add-day" onclick="addMealPlanToLog(${index})">
                    ➕ Add to My Log
                </button>
            </div>
        `;
        container.appendChild(dayCard);
    });
}

function addMealPlanToLog(dayIndex) {
    const mealPlan = getMealPlan();
    const selectedDay = mealPlan[dayIndex];

    const logDate = document.getElementById('logDate').value;
    if (!logDate) {
        alert('Please select a date in the Log tab first!');
        return;
    }

    document.getElementById('logCalories').value = selectedDay.calories;
    document.getElementById('logProtein').value = selectedDay.protein;
    document.getElementById('logWorkout').value = selectedDay.workout ? 'true' : 'false';

    showToast(`${selectedDay.day}'s meal plan added! (${selectedDay.calories} cal, ${selectedDay.protein}g protein)`);

    switchTab('log');
    setTimeout(() => {
        document.getElementById('logCalories').scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 300);
}

function generateGroceryList() {
    const groceryList = {
        'Proteins': [
            '5-6 lbs chicken breast',
            '2 lbs chicken thighs',
            '2 lbs lean ground turkey (93/7)',
            '1 lb ground beef (93/7)',
            '1 lb pork tenderloin',
            '1 lb tilapia or cod',
            '1 lb salmon',
            '1 lb shrimp',
            '1 lb sirloin steak',
            '3 dozen eggs',
            '2 lbs Greek yogurt (0% fat)',
            '1 lb cottage cheese (low fat)',
            '2-3 tubs whey protein powder'
        ],
        'Carbs': [
            '5 lbs white rice',
            '2 lbs brown rice',
            '1 lb jasmine rice',
            '1 lb quinoa',
            '1 box whole wheat pasta',
            '1 lb oatmeal',
            '5-6 large sweet potatoes',
            '3-4 red potatoes',
            '1 loaf whole wheat bread',
            '1 box whole grain waffles'
        ],
        'Vegetables': [
            '7 bags/bunches broccoli',
            '3 bags spinach',
            '2 lbs green beans',
            '2 lbs bell peppers',
            '2 lbs asparagus',
            '1 bag brussels sprouts',
            '1 lb carrots',
            '2 bags mixed salad greens',
            '1 cauliflower',
            '2 zucchini'
        ],
        'Fruits': [
            '7 bananas',
            '7 apples',
            '3 oranges',
            '2 lbs mixed berries',
            '1 lb grapes'
        ],
        'Other': [
            'Olive oil',
            'Marinara sauce',
            'Light caesar dressing',
            'Seasonings (salt, pepper, garlic powder)',
            'Almond milk',
            'Almonds',
            'Granola',
            'Turkey bacon',
            'Turkey sausage',
            'String cheese',
            'Sugar-free syrup'
        ]
    };

    const display = document.getElementById('groceryListDisplay');
    display.innerHTML = '';

    Object.keys(groceryList).forEach(category => {
        const categoryDiv = document.createElement('div');
        categoryDiv.innerHTML = `<div class="grocery-category">📦 ${category}</div>`;

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'grocery-list';

        groceryList[category].forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'grocery-item';
            itemDiv.textContent = item;
            itemsDiv.appendChild(itemDiv);
        });

        display.appendChild(categoryDiv);
        display.appendChild(itemsDiv);
    });

    document.getElementById('groceryListCard').style.display = 'block';
    showToast('Grocery list generated! 🛒');

    setTimeout(() => {
        document.getElementById('groceryListCard').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

function toggleCollapsible(sectionId) {
    const content = document.getElementById(sectionId + 'Content');
    const toggle = document.getElementById(sectionId + 'Toggle');

    if (content.classList.contains('open')) {
        content.classList.remove('open');
        toggle.classList.remove('open');
    } else {
        content.classList.add('open');
        toggle.classList.add('open');
    }
}

// ===========================
// CHART
// ===========================

function drawChart() {
    const data = loadData();
    const canvas = document.getElementById('weightChart');
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = 250 * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = 250;

    ctx.clearRect(0, 0, width, height);

    if (data.entries.length === 0) {
        ctx.fillStyle = '#64748b';
        ctx.font = '14px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText('No data yet - start logging!', width / 2, height / 2);
        return;
    }

    const entries = [...data.entries];
    const weights = entries.map(e => e.weight);
    const minWeight = Math.min(...weights, data.settings.goalWeight) - 5;
    const maxWeight = Math.max(...weights, data.settings.startWeight) + 5;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();

    // Goal line
    const goalY = height - padding - ((data.settings.goalWeight - minWeight) / (maxWeight - minWeight)) * chartHeight;
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, goalY);
    ctx.lineTo(width - padding, goalY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#86efac';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'left';
    ctx.fillText(`Goal: ${data.settings.goalWeight} lb`, padding + 5, goalY - 5);

    // Weight line
    ctx.strokeStyle = '#60a5fa';
    ctx.lineWidth = 3;
    ctx.beginPath();

    entries.forEach((entry, i) => {
        const x = padding + (i / (entries.length - 1 || 1)) * chartWidth;
        const y = height - padding - ((entry.weight - minWeight) / (maxWeight - minWeight)) * chartHeight;

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Data points
    entries.forEach((entry, i) => {
        const x = padding + (i / (entries.length - 1 || 1)) * chartWidth;
        const y = height - padding - ((entry.weight - minWeight) / (maxWeight - minWeight)) * chartHeight;

        ctx.fillStyle = '#3b82f6';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (i === 0 || i === entries.length - 1) {
            ctx.fillStyle = '#93c5fd';
            ctx.font = '11px system-ui';
            ctx.textAlign = 'center';
            ctx.fillText(`${entry.weight} lb`, x, y - 12);
        }
    });

    // Y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 4; i++) {
        const weight = minWeight + (maxWeight - minWeight) * (i / 4);
        const y = height - padding - (i / 4) * chartHeight;
        ctx.fillText(weight.toFixed(0), padding - 10, y + 4);
    }
}

// ===========================
// INITIALIZATION
// ===========================

function initializeApp() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('logDate').value = today;

    loadSettings();

    const data = loadData();
    if (data.entries.length > 0) {
        const lastWeight = data.entries[data.entries.length - 1].weight;
        document.getElementById('logWeight').value = lastWeight;
    }

    updateDashboard();
    updateHistoryTable();
    updateMealLibrary();
    updateMealSelect();
    updateDailyMeals();
    drawChart();
    renderMealPlan();

    document.getElementById('logDate').addEventListener('change', updateDailyMeals);
}

window.addEventListener('load', initializeApp);

window.addEventListener('resize', () => {
    setTimeout(drawChart, 100);
});
