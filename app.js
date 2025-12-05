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
        weeklyMeal: null
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
// WEEKLY MEAL MANAGEMENT
// ===========================

// Preview image as user types URL
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('weeklyMealImage');
    if (imageInput) {
        imageInput.addEventListener('input', (e) => {
            const url = e.target.value.trim();
            const preview = document.getElementById('imagePreview');

            if (url && (url.startsWith('http://') || url.startsWith('https://'))) {
                preview.innerHTML = `<img src="${url}" onerror="this.parentElement.style.display='none'" onload="this.parentElement.classList.add('show')">`;
            } else {
                preview.innerHTML = '';
                preview.classList.remove('show');
            }
        });
    }
});

function saveWeeklyMeal() {
    const name = document.getElementById('weeklyMealName').value.trim();
    const imageUrl = document.getElementById('weeklyMealImage').value.trim();
    const calories = parseInt(document.getElementById('weeklyMealCalories').value);
    const protein = parseInt(document.getElementById('weeklyMealProtein').value);
    const ingredients = document.getElementById('weeklyMealIngredients').value.trim();

    if (!name || !calories || !protein) {
        alert('Please enter meal name, calories, and protein!');
        return;
    }

    const data = loadData();
    data.weeklyMeal = {
        name,
        imageUrl,
        calories,
        protein,
        ingredients
    };

    saveData(data);
    showToast('Weekly meal saved! 🍱');

    displaySavedMeal();
}

function displaySavedMeal() {
    const data = loadData();
    const card = document.getElementById('savedMealCard');
    const display = document.getElementById('savedMealDisplay');

    if (!data.weeklyMeal) {
        card.style.display = 'none';
        return;
    }

    const meal = data.weeklyMeal;
    display.innerHTML = `
        <div class="saved-meal-display">
            ${meal.imageUrl ? `
                <div class="meal-image-container">
                    <img src="${meal.imageUrl}" alt="${meal.name}">
                </div>
            ` : ''}
            <div class="meal-details">
                <h3>${meal.name}</h3>
                <div class="meal-macros">
                    <div class="meal-macro-item">
                        <div class="meal-macro-label">Calories</div>
                        <div class="meal-macro-value">${meal.calories}</div>
                    </div>
                    <div class="meal-macro-item">
                        <div class="meal-macro-label">Protein</div>
                        <div class="meal-macro-value">${meal.protein}g</div>
                    </div>
                </div>
                ${meal.ingredients ? `
                    <div class="meal-ingredients">
                        <div class="meal-ingredients-title">Ingredients</div>
                        <div class="meal-ingredients-list">${meal.ingredients}</div>
                    </div>
                ` : ''}
                <button class="btn btn-primary" style="margin-top: 16px;" onclick="useWeeklyMealInLog()">
                    ➕ Use This Meal in Log
                </button>
            </div>
        </div>
    `;
    card.style.display = 'block';
}

function useWeeklyMealInLog() {
    const data = loadData();
    if (!data.weeklyMeal) return;

    document.getElementById('logCalories').value = data.weeklyMeal.calories;
    document.getElementById('logProtein').value = data.weeklyMeal.protein;

    showToast(`Meal data added to log! (${data.weeklyMeal.calories} cal, ${data.weeklyMeal.protein}g protein)`);
    switchTab('log');
}

// ===========================
// MEAL SUGGESTIONS
// ===========================

function getMealSuggestions() {
    return [
        {
            name: 'Chicken Rice Bowl',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            calories: 1750,
            protein: 185,
            ingredients: '8 oz grilled chicken breast\n2 cups white rice\n1 cup steamed broccoli\n1 tbsp olive oil\nSeasonings (garlic, paprika, salt, pepper)'
        },
        {
            name: 'Salmon & Sweet Potato',
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
            calories: 1700,
            protein: 170,
            ingredients: '8 oz grilled salmon\n2 medium sweet potatoes\n2 cups asparagus\n1 tbsp butter\nLemon and herbs'
        },
        {
            name: 'Beef Stir-Fry',
            imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
            calories: 1800,
            protein: 190,
            ingredients: '8 oz lean beef strips\n2 cups jasmine rice\nMixed vegetables (peppers, onions, carrots)\nSoy sauce and ginger\n1 tbsp sesame oil'
        },
        {
            name: 'Turkey Ground Bowl',
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
            calories: 1720,
            protein: 180,
            ingredients: '8 oz lean ground turkey (93/7)\n2 cups brown rice\n1 cup black beans\nSalsa and Greek yogurt\nMixed greens'
        },
        {
            name: 'Egg & Veggie Scramble',
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
            calories: 1650,
            protein: 175,
            ingredients: '6 whole eggs\n4 egg whites\n2 cups mixed vegetables\n4 slices whole wheat toast\n1 cup oatmeal with berries'
        },
        {
            name: 'Shrimp Pasta',
            imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
            calories: 1780,
            protein: 172,
            ingredients: '8 oz shrimp\n2.5 cups whole wheat pasta\nMarinara sauce\n2 cups spinach\nParmesan cheese (2 tbsp)'
        }
    ];
}

function renderMealSuggestions() {
    const suggestions = getMealSuggestions();
    const container = document.getElementById('mealSuggestions');
    container.innerHTML = '';

    suggestions.forEach((meal) => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <img src="${meal.imageUrl}" alt="${meal.name}" class="suggestion-image">
            <div class="suggestion-content">
                <div class="suggestion-title">${meal.name}</div>
                <div class="suggestion-macros">
                    <div class="suggestion-macro"><strong>${meal.calories}</strong> cal</div>
                    <div class="suggestion-macro"><strong>${meal.protein}g</strong> protein</div>
                </div>
                <div class="suggestion-ingredients">${meal.ingredients}</div>
                <button class="suggestion-button" onclick='useMealSuggestion(${JSON.stringify(meal).replace(/'/g, "&apos;")})'>
                    ✅ Use This Meal
                </button>
            </div>
        `;
        container.appendChild(card);
    });
}

function useMealSuggestion(meal) {
    const data = loadData();
    data.weeklyMeal = {
        name: meal.name,
        imageUrl: meal.imageUrl,
        calories: meal.calories,
        protein: meal.protein,
        ingredients: meal.ingredients
    };

    saveData(data);
    showToast(`${meal.name} set as your weekly meal! 🍱`);

    // Update the form in Meals tab
    document.getElementById('weeklyMealName').value = meal.name;
    document.getElementById('weeklyMealImage').value = meal.imageUrl;
    document.getElementById('weeklyMealCalories').value = meal.calories;
    document.getElementById('weeklyMealProtein').value = meal.protein;
    document.getElementById('weeklyMealIngredients').value = meal.ingredients;

    // Display the saved meal
    displaySavedMeal();

    // Switch to Meals tab
    switchTab('meals');
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
// QUICK MEAL DISPLAY IN LOG TAB
// ===========================

function displayQuickMeal() {
    const data = loadData();
    const card = document.getElementById('quickMealCard');
    const display = document.getElementById('quickMealDisplay');

    if (!data.weeklyMeal) {
        card.style.display = 'none';
        return;
    }

    const meal = data.weeklyMeal;
    display.innerHTML = `
        <div style="display: flex; align-items: center; gap: 16px; flex-wrap: wrap;">
            ${meal.imageUrl ? `
                <img src="${meal.imageUrl}" alt="${meal.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 10px;">
            ` : ''}
            <div style="flex: 1;">
                <div style="font-size: 16px; font-weight: 700; color: #e2e8f0; margin-bottom: 8px;">${meal.name}</div>
                <div style="display: flex; gap: 16px; font-size: 13px; color: #94a3b8; margin-bottom: 12px;">
                    <span><strong style="color: #60a5fa;">${meal.calories}</strong> cal</span>
                    <span><strong style="color: #60a5fa;">${meal.protein}g</strong> protein</span>
                </div>
                <button class="btn btn-small" onclick="useWeeklyMealInLog()">➕ Add to Today's Log</button>
            </div>
        </div>
    `;
    card.style.display = 'block';
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
    displaySavedMeal();
    displayQuickMeal();
    drawChart();
    renderMealSuggestions();
}

window.addEventListener('load', initializeApp);

window.addEventListener('resize', () => {
    setTimeout(drawChart, 100);
});
