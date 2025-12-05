// ===========================
// PWA SERVICE WORKER REGISTRATION
// ===========================

// Temporarily disabled for development
// if ('serviceWorker' in navigator) {
//     window.addEventListener('load', () => {
//         navigator.serviceWorker.register('./service-worker.js')
//             .then(reg => console.log('Service Worker registered:', reg))
//             .catch(err => console.log('Service Worker registration failed:', err));
//     });
// }

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
}

// ===========================
// WEEKLY MEAL MANAGEMENT
// ===========================

function setupImagePreview() {
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
}

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

    if (!card || !display) {
        console.error('Saved meal card or display not found');
        return;
    }

    if (!data.weeklyMeal) {
        console.log('No weekly meal saved yet');
        card.style.display = 'none';
        return;
    }

    console.log('Displaying saved meal:', data.weeklyMeal.name);
    const meal = data.weeklyMeal;
    display.innerHTML = `
        <div class="saved-meal-display">
            ${meal.imageUrl ? `
                <div class="meal-image-container">
                    <img src="${meal.imageUrl}" alt="${meal.name}" loading="lazy">
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
                        <div class="meal-ingredients-list">${meal.ingredients.replace(/\n/g, '<br>')}</div>
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
// COLLAPSIBLE SECTIONS
// ===========================

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
// MEAL SUGGESTIONS
// ===========================

function getMealSuggestions() {
    return [
        {
            name: 'Chicken Rice Bowl',
            imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80',
            calories: 1750,
            protein: 185,
            breakfast: {
                time: '7:00 AM',
                food: '4 whole eggs scrambled\n2 slices whole wheat toast\n1 banana\nBlack coffee or green tea',
                cals: 450,
                protein: 32
            },
            lunch: {
                time: '12:30 PM',
                food: '4 oz grilled chicken breast\n1.5 cups white rice\n1 cup steamed broccoli\n1 tsp olive oil',
                cals: 550,
                protein: 52
            },
            dinner: {
                time: '6:30 PM',
                food: '4 oz grilled chicken breast\n1 cup white rice\n1 cup steamed broccoli\nSeasonings',
                cals: 450,
                protein: 52
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 scoop whey protein shake\n1 apple\n1 cup Greek yogurt (0% fat)',
                cals: 300,
                protein: 49
            },
            water: '1 gallon (128 oz) - Drink 16 oz with each meal and sip throughout day',
            groceryList: '3.5 lbs chicken breast (for 7 days)\n2 dozen eggs\n1 loaf whole wheat bread\n7 bananas\n2 lbs white rice\n2 bags frozen broccoli\nOlive oil\n7 apples\n2 large Greek yogurt containers\n1 tub whey protein\nCoffee/tea\nSeasonings'
        },
        {
            name: 'Salmon & Sweet Potato',
            imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800&q=80',
            calories: 1700,
            protein: 170,
            breakfast: {
                time: '7:00 AM',
                food: '1 cup oatmeal with protein powder\n1 tbsp almond butter\n1/2 cup berries\nGreen tea',
                cals: 420,
                protein: 35
            },
            lunch: {
                time: '12:30 PM',
                food: '5 oz grilled salmon\n1 large sweet potato\n1 cup asparagus\nLemon and dill',
                cals: 580,
                protein: 62
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz grilled salmon\n1 medium sweet potato\n1 cup asparagus\n1 tbsp butter',
                cals: 520,
                protein: 55
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '2 hard boiled eggs\n1 protein shake\nHandful almonds',
                cals: 280,
                protein: 38
            },
            water: '1 gallon (128 oz) - Critical for omega-3 absorption. Drink 20 oz upon waking.',
            groceryList: '3.5 lbs salmon fillets (for 7 days)\n14 medium sweet potatoes\n3 lbs asparagus\nButter\n2 lemons, fresh dill\n1 container oatmeal\n1 tub protein powder\nAlmond butter\nFrozen berries\n2 dozen eggs\nAlmonds'
        },
        {
            name: 'Beef Stir-Fry',
            imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=80',
            calories: 1800,
            protein: 190,
            breakfast: {
                time: '7:00 AM',
                food: '3 whole eggs + 3 egg whites scramble\n1 cup mixed berries\n2 turkey sausage links\nBlack coffee',
                cals: 440,
                protein: 42
            },
            lunch: {
                time: '12:30 PM',
                food: '4 oz lean beef strips stir-fry\n1.5 cups jasmine rice\nBell peppers, onions, carrots\nSoy sauce, ginger, sesame oil',
                cals: 620,
                protein: 68
            },
            dinner: {
                time: '6:30 PM',
                food: '4 oz lean beef strips stir-fry\n1 cup jasmine rice\nMixed vegetables\nLow-sodium soy sauce',
                cals: 520,
                protein: 58
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\n1 banana\n1 string cheese',
                cals: 320,
                protein: 42
            },
            water: '1 gallon+ (128 oz) - Red meat needs extra hydration. Drink 24 oz before workouts.',
            groceryList: '3.5 lbs lean beef sirloin (for 7 days)\n3 dozen eggs\n1 package turkey sausage\n2 lbs jasmine rice\n4 bell peppers\n3 onions\n1 lb carrots\n1 bag frozen berries\n7 bananas\nString cheese\nSoy sauce, ginger, sesame oil\n1 tub protein powder'
        },
        {
            name: 'Turkey Ground Bowl',
            imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
            calories: 1720,
            protein: 180,
            breakfast: {
                time: '7:00 AM',
                food: 'Protein pancakes (1 scoop powder, 2 eggs, oats)\nSugar-free syrup\n1 turkey sausage patty\nCoffee',
                cals: 410,
                protein: 38
            },
            lunch: {
                time: '12:30 PM',
                food: '4 oz ground turkey (seasoned)\n1.5 cups brown rice\n1/2 cup black beans\nSalsa, Greek yogurt\nMixed greens',
                cals: 590,
                protein: 62
            },
            dinner: {
                time: '6:30 PM',
                food: '4 oz ground turkey taco bowl\n1 cup brown rice\n1/2 cup black beans\nSalsa, cheese, veggies',
                cals: 520,
                protein: 58
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\n1 apple\n2 tbsp peanut butter',
                cals: 300,
                protein: 42
            },
            water: '1 gallon (128 oz) - Fiber from beans needs hydration. Drink 16 oz between meals.',
            groceryList: '3.5 lbs ground turkey 93/7 (for 7 days)\n2 dozen eggs\n1 container oats\n1 tub protein powder\n1 package turkey sausage\n2 lbs brown rice\n3 cans black beans\n1 jar salsa\n2 large containers Greek yogurt\n2 bags mixed greens\n7 apples\nPeanut butter\nShredded cheese\nTaco seasoning'
        },
        {
            name: 'Egg & Veggie Scramble',
            imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&q=80',
            calories: 1650,
            protein: 175,
            breakfast: {
                time: '7:00 AM',
                food: '3 whole eggs + 2 egg whites scramble\nMixed peppers, onions, spinach\n2 slices whole wheat toast\nBlack coffee',
                cals: 380,
                protein: 35
            },
            lunch: {
                time: '12:30 PM',
                food: 'Veggie-packed omelet (3 eggs)\n1 cup white rice\n1 cup steamed broccoli\n1 apple',
                cals: 560,
                protein: 48
            },
            dinner: {
                time: '6:30 PM',
                food: 'Egg white stir-fry (6 egg whites + 2 whole eggs)\nMixed vegetables\n1 cup quinoa\nSeasonings',
                cals: 510,
                protein: 62
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\n1 cup cottage cheese\n1 banana',
                cals: 300,
                protein: 50
            },
            water: '1 gallon (128 oz) - High protein needs hydration. Drink 20 oz upon waking.',
            groceryList: '5 dozen eggs (for 7 days)\n3 bags frozen mixed vegetables\n2 bell peppers\n2 onions\n1 bag fresh spinach\n1 loaf whole wheat bread\n1 lb quinoa\n2 lbs white rice\n7 apples\n7 bananas\n1 large cottage cheese\n1 tub protein powder\nBroccoli\nCoffee'
        },
        {
            name: 'Shrimp Pasta',
            imageUrl: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=80',
            calories: 1780,
            protein: 172,
            breakfast: {
                time: '7:00 AM',
                food: '4 whole eggs scrambled\n1 cup oatmeal\n1/2 cup berries\nGreen tea',
                cals: 440,
                protein: 32
            },
            lunch: {
                time: '12:30 PM',
                food: '6 oz garlic butter shrimp\n2 cups whole wheat pasta\nMarinara sauce\n1 cup spinach\nParmesan (1 tbsp)',
                cals: 640,
                protein: 68
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz lemon herb shrimp\n1.5 cups whole wheat pasta\nMarinara sauce\nSpinach salad with vinaigrette',
                cals: 540,
                protein: 58
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\nHandful almonds\n1 Greek yogurt',
                cals: 260,
                protein: 34
            },
            water: '1+ gallons (140 oz) - Seafood high in sodium. Drink 24 oz with each meal.',
            groceryList: '3.5 lbs fresh/frozen shrimp (for 7 days)\n2 boxes whole wheat pasta\n2 jars marinara sauce\n3 bags fresh spinach\nParmesan cheese\n1 container oatmeal\n1 bag frozen berries\n3 dozen eggs\nAlmonds\n7 Greek yogurts\n1 tub protein powder\nGarlic, butter, lemon, herbs\nGreen tea'
        },
        {
            name: 'Steak & Potatoes',
            imageUrl: 'https://images.unsplash.com/photo-1432139555190-58524dae6a55?w=800&q=80',
            calories: 1820,
            protein: 195,
            breakfast: {
                time: '7:00 AM',
                food: 'Steak & eggs (3 oz leftover steak, 3 eggs)\n2 slices whole wheat toast\n1 orange\nBlack coffee',
                cals: 480,
                protein: 48
            },
            lunch: {
                time: '12:30 PM',
                food: '5 oz grilled sirloin steak\n1 large baked potato\n1 tbsp butter\n1 cup green beans\nA1 sauce',
                cals: 660,
                protein: 72
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz grilled sirloin\n1 medium baked potato\n1 cup roasted green beans\nGarlic butter\nSteak seasoning',
                cals: 580,
                protein: 68
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: 'Beef jerky (2 oz)\n1 apple\n1 protein shake',
                cals: 280,
                protein: 45
            },
            water: '1+ gallons (140 oz) - Red meat needs extra water for digestion. Drink 32 oz after dinner.',
            groceryList: '4 lbs sirloin steak (for 7 days + breakfast)\n21 medium potatoes (3/day)\n3 lbs green beans\nButter\nSteak seasoning (Montreal, garlic, pepper)\n3 dozen eggs\n1 loaf whole wheat bread\n7 oranges\n7 apples\nBeef jerky\n1 tub protein powder\nA1 sauce\nGarlic\nCoffee'
        },
        {
            name: 'Protein Burrito Bowl',
            imageUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=800&q=80',
            calories: 1730,
            protein: 182,
            breakfast: {
                time: '7:00 AM',
                food: 'Breakfast burrito bowl\n3 scrambled eggs\n1/2 cup black beans\n1/4 cup cheese\nSalsa\nCoffee',
                cals: 420,
                protein: 38
            },
            lunch: {
                time: '12:30 PM',
                food: '5 oz grilled chicken\n1.5 cups cilantro-lime rice\n1/2 cup black beans\n1/2 cup corn\nGuacamole\nSalsa\nGreek yogurt',
                cals: 640,
                protein: 68
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz seasoned chicken\n1 cup cilantro-lime rice\n1/2 cup black beans\nCheese (2 tbsp)\nPico de gallo\nLettuce',
                cals: 560,
                protein: 62
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: 'Protein shake\nTortilla chips & salsa (1 oz)\n1 string cheese',
                cals: 310,
                protein: 34
            },
            water: '1 gallon (128 oz) - Fiber from beans needs water. Drink 20 oz between meals.',
            groceryList: '4 lbs chicken breast (for 7 days)\n2 lbs white rice\n4 cans black beans\n2 cans corn\nFresh cilantro (2 bunches)\n7 limes\n2 jars salsa\n2 large Greek yogurts\nShredded cheese (Mexican blend)\n7 avocados\n2 dozen eggs\n1 bag tortilla chips\nString cheese\n1 tub protein powder\nRomaine lettuce\nTomatoes for pico\nCoffee\nTaco seasoning'
        },
        {
            name: 'Tuna Rice Bowl',
            imageUrl: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800&q=80',
            calories: 1680,
            protein: 168,
            breakfast: {
                time: '7:00 AM',
                food: '4 whole eggs scrambled\n1 cup white rice\nSoy sauce\nGreen tea',
                cals: 420,
                protein: 32
            },
            lunch: {
                time: '12:30 PM',
                food: '2 cans tuna (drained)\n1.5 cups white rice\n1 cup edamame\nSoy sauce, sesame oil\nSriracha mayo\nSeaweed snack',
                cals: 620,
                protein: 68
            },
            dinner: {
                time: '6:30 PM',
                food: '1.5 cans tuna\n1 cup white rice\n1 cup edamame\nSoy sauce\nDiced cucumber\nGinger',
                cals: 540,
                protein: 58
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\n1 banana\nHandful almonds',
                cals: 280,
                protein: 30
            },
            water: '1+ gallons (140 oz) - Tuna is salty. Drink 24 oz with each meal to flush sodium.',
            groceryList: '21 cans tuna in water (3 cans/day for 7 days)\n3 lbs white rice\n2 bags frozen edamame\nSoy sauce (low sodium)\nSesame oil\nSriracha\nMayo (light)\n3 dozen eggs\n7 bananas\nAlmonds\n1 tub protein powder\nSeaweed snacks\n2 cucumbers\nFresh ginger\nGreen tea'
        },
        {
            name: 'Pork Chop Dinner',
            imageUrl: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=800&q=80',
            calories: 1760,
            protein: 178,
            breakfast: {
                time: '7:00 AM',
                food: '3 oz leftover pork (diced)\n3 eggs scrambled\n1 cup hash browns\nBlack coffee',
                cals: 450,
                protein: 42
            },
            lunch: {
                time: '12:30 PM',
                food: '5 oz grilled pork chop\n1.5 cups white rice\n1 cup roasted Brussels sprouts\n1 tbsp olive oil\nApple sauce',
                cals: 630,
                protein: 68
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz seasoned pork chop\n1 cup white rice\n1 cup Brussels sprouts\nGarlic butter\nThyme & rosemary',
                cals: 580,
                protein: 62
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\n1 apple\nPork rinds (1 oz)',
                cals: 280,
                protein: 36
            },
            water: '1 gallon (128 oz) - Pork is filling. Drink 16 oz 30 min before meals.',
            groceryList: '8 pork chops (5-6 oz each, for 7 days + breakfast)\n3 lbs white rice\n4 lbs Brussels sprouts\nOlive oil\nButter\n3 dozen eggs\n1 bag hash browns\n7 apples\nApple sauce\nPork rinds\n1 tub protein powder\nSeasonings (garlic powder, thyme, rosemary, salt, pepper)\nCoffee'
        },
        {
            name: 'Greek Chicken Plate',
            imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=800&q=80',
            calories: 1710,
            protein: 185,
            breakfast: {
                time: '7:00 AM',
                food: 'Greek yogurt bowl (2 cups)\n1 scoop protein powder\nHoney and walnuts\nBlack coffee',
                cals: 420,
                protein: 52
            },
            lunch: {
                time: '12:30 PM',
                food: '5 oz grilled chicken (lemon-herb)\n1.5 cups couscous\nCucumber tomato salad\nTzatziki sauce\nOlives (5-6)\nFeta cheese',
                cals: 640,
                protein: 68
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz grilled chicken\n1 cup couscous\nGreek salad (cucumber, tomato, onion)\nTzatziki\nFeta cheese\nPita bread (1 piece)',
                cals: 580,
                protein: 62
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: 'Hummus with veggies\n1 protein shake\n1 small Greek yogurt',
                cals: 270,
                protein: 33
            },
            water: '1 gallon (128 oz) - Mediterranean diet. Drink 16 oz with lemon in morning.',
            groceryList: '4 lbs chicken breast (for 7 days)\n2 boxes couscous\n10 cucumbers\n10 tomatoes\n2 red onions\n2 containers tzatziki sauce\n1 jar kalamata olives\n1 large block feta cheese\n3 large containers Greek yogurt (0% or 2%)\n1 tub protein powder\nHoney\nWalnuts\n1 container hummus\nBaby carrots\nPita bread\nLemons\nFresh oregano, dill\nCoffee'
        },
        {
            name: 'BBQ Chicken & Fries',
            imageUrl: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80',
            calories: 1790,
            protein: 180,
            breakfast: {
                time: '7:00 AM',
                food: 'Chicken & egg breakfast wrap\n3 oz BBQ chicken (leftover)\n2 eggs\n1 whole wheat tortilla\nCoffee',
                cals: 440,
                protein: 48
            },
            lunch: {
                time: '12:30 PM',
                food: '6 oz BBQ chicken breast\n1 large potato (air-fried as fries)\n1 cup coleslaw\nBBQ sauce (2 tbsp)\nPickles',
                cals: 660,
                protein: 72
            },
            dinner: {
                time: '6:30 PM',
                food: '5 oz BBQ chicken\n1 medium potato (air-fried)\n1 cup coleslaw\nCorn on the cob (1 ear)\nBBQ sauce',
                cals: 600,
                protein: 68
            },
            snacks: {
                times: '10:00 AM & 3:30 PM & 9:00 PM',
                food: '1 protein shake\n1 apple\nChicken jerky (1 oz)',
                cals: 290,
                protein: 42
            },
            water: '1 gallon (128 oz) - BBQ sauce is high sodium. Drink 20 oz with each meal.',
            groceryList: '4.5 lbs chicken breast (for 7 days + breakfast)\n21 large potatoes (3/day)\n2 bags coleslaw mix\n1 large bottle BBQ sauce (low sugar)\nColeslaw dressing\n1 dozen eggs\n1 package whole wheat tortillas\n7 apples\nChicken jerky\n1 tub protein powder\n7 ears corn (frozen or fresh)\nPickles\nCooking spray (for air fryer)\nCoffee'
        }
    ];
}

function renderMealSuggestions() {
    const suggestions = getMealSuggestions();
    const container = document.getElementById('mealSuggestions');

    if (!container) {
        console.error('Meal suggestions container not found');
        return;
    }

    console.log('Rendering meal suggestions:', suggestions.length);
    container.innerHTML = '';

    suggestions.forEach((meal, index) => {
        const card = document.createElement('div');
        card.className = 'suggestion-card';
        card.innerHTML = `
            <img src="${meal.imageUrl}" alt="${meal.name}" class="suggestion-image" loading="lazy">
            <div class="suggestion-content">
                <div class="suggestion-title">${meal.name}</div>
                <div class="suggestion-macros">
                    <div class="suggestion-macro"><strong>${meal.calories}</strong> cal/day</div>
                    <div class="suggestion-macro"><strong>${meal.protein}g</strong> protein/day</div>
                </div>
                
                <div class="meal-schedule">
                    <div class="meal-time-block">
                        <div class="meal-time-header">🌅 BREAKFAST - ${meal.breakfast.time}</div>
                        <div class="meal-time-content">${meal.breakfast.food.replace(/\n/g, '<br>')}</div>
                        <div class="meal-time-macros">${meal.breakfast.cals} cal • ${meal.breakfast.protein}g protein</div>
                    </div>
                    
                    <div class="meal-time-block">
                        <div class="meal-time-header">☀️ LUNCH - ${meal.lunch.time}</div>
                        <div class="meal-time-content">${meal.lunch.food.replace(/\n/g, '<br>')}</div>
                        <div class="meal-time-macros">${meal.lunch.cals} cal • ${meal.lunch.protein}g protein</div>
                    </div>
                    
                    <div class="meal-time-block">
                        <div class="meal-time-header">🌙 DINNER - ${meal.dinner.time}</div>
                        <div class="meal-time-content">${meal.dinner.food.replace(/\n/g, '<br>')}</div>
                        <div class="meal-time-macros">${meal.dinner.cals} cal • ${meal.dinner.protein}g protein</div>
                    </div>
                    
                    <div class="meal-time-block snacks">
                        <div class="meal-time-header">🍎 SNACKS - ${meal.snacks.times}</div>
                        <div class="meal-time-content">${meal.snacks.food.replace(/\n/g, '<br>')}</div>
                        <div class="meal-time-macros">${meal.snacks.cals} cal • ${meal.snacks.protein}g protein</div>
                    </div>
                </div>
                
                <div class="meal-time-block hydration">
                    <div class="meal-time-header">💧 HYDRATION PROTOCOL</div>
                    <div class="meal-time-content">${meal.water}</div>
                </div>
                
                <div class="meal-time-block grocery">
                    <div class="meal-time-header">🛒 WEEKLY GROCERY LIST</div>
                    <div class="meal-time-content" style="line-height: 1.6;">${meal.groceryList.replace(/\n/g, '<br>')}</div>
                </div>
                
                <button class="suggestion-button" onclick='useMealSuggestion(${JSON.stringify(meal).replace(/'/g, "&apos;")})'>
                    ✅ MAKE THIS MY PLAN
                </button>
            </div>
        `;
        container.appendChild(card);
        console.log(`Added meal card ${index + 1}:`, meal.name);
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
    setupImagePreview();
}

window.addEventListener('load', initializeApp);

window.addEventListener('resize', () => {
    setTimeout(drawChart, 100);
});