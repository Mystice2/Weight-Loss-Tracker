# 🇯🇵 Japan Cut Tracker - PWA

A modern, mobile-first Progressive Web App for tracking your aggressive 5-month weight loss journey.

## 🎯 Features

### ✨ Tabbed Interface
- **Dashboard**: Progress stats, weight chart, recent history
- **Log**: Daily weight, calories, protein, steps, workout tracking
- **Meals**: Custom meal library and daily meal planning
- **Plan**: Pre-built 7-day meal plans with grocery lists
- **Settings**: Configure targets and manage data

### 📱 PWA Capabilities
- **Install to Home Screen** on iPhone/Android
- **Works Offline** - all data stored locally
- **App-like Experience** - full screen, no browser UI
- **Fast & Responsive** - optimized for mobile devices

### 💪 Core Features
- Real-time progress tracking with 6 key metrics
- Visual weight trend chart
- Daily logging with meal integration
- Pre-built aggressive cut meal plans (1,650-1,800 cal)
- Automatic grocery list generation
- Meal prep guide with pro tips
- Complete meal library system
- All data persists in localStorage

## 📁 Project Structure

```
Weight Loss Journey/
├── index.html           # Main HTML file with tabbed layout
├── styles.css           # Complete CSS with modern design
├── app.js              # All JavaScript functionality
├── manifest.json       # PWA manifest
├── service-worker.js   # Service worker for offline mode
├── generate-icons.html # Tool to create app icons
└── icons/
    ├── icon-192.png    # 192x192 app icon
    └── icon-512.png    # 512x512 app icon
```

## 🚀 Installation

### For Development
1. Open the `Weight Loss Journey` folder
2. Open `generate-icons.html` in a browser
3. Download the icons and save them to the `icons` folder
4. Open `index.html` in a modern browser

### For iPhone Installation
1. Upload all files to a web server OR use a local server:
   ```bash
   # Option 1: Python
   python -m http.server 8000
   
   # Option 2: Node.js
   npx http-server
   ```
2. Open the URL in Safari on iPhone
3. Tap the Share button (square with arrow)
4. Scroll down and tap "Add to Home Screen"
5. Tap "Add" in the top right
6. The app icon will appear on your home screen!

### For Android Installation
1. Open the URL in Chrome
2. Tap the menu (3 dots)
3. Tap "Add to Home Screen"
4. Tap "Add"

## 🎨 UI/UX Improvements

### Tabbed Navigation
- Bottom tab bar with 5 sections
- Smooth transitions between tabs
- Active tab highlighting
- Icons + labels for clarity

### Modern Design
- Dark gradient background
- Glass-morphism effects
- Smooth animations
- Touch-optimized buttons
- Responsive grid layouts

### Mobile-First
- Sticky header
- Fixed bottom navigation
- Safe area support for iPhone notch
- Touch-friendly button sizes
- Optimized for one-handed use

## 📊 Data Structure

All data is stored in `localStorage` under the key `japanCutData`:

```javascript
{
  settings: {
    startWeight: 260,
    goalWeight: 200,
    startDate: "2025-12-05",
    goalDate: "2025-05-15",
    calorieTarget: 1750,
    proteinTarget: 180,
    stepTarget: 12000
  },
  entries: [
    {
      date: "2025-12-05",
      weight: 258.5,
      calories: 1750,
      protein: 180,
      steps: 12500,
      workout: true
    }
  ],
  meals: [
    {
      id: "1234567890",
      name: "Breakfast - Eggs",
      calories: 450,
      protein: 35,
      notes: "3 eggs, 2 toast"
    }
  ],
  dailyMeals: {
    "2025-12-05": ["1234567890", "1234567891"]
  }
}
```

## 🔧 Customization

### Change Colors
Edit `styles.css`:
```css
/* Primary color */
color: #60a5fa; /* Blue */

/* Background gradient */
background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
```

### Modify Meal Plans
Edit `app.js` in the `getMealPlan()` function to customize the 7-day plan.

### Adjust Targets
Go to Settings tab in the app to change:
- Start/Goal weights
- Calorie targets
- Protein targets
- Step goals
- Timeline dates

## 📱 iPhone-Specific Features

### Status Bar
- Black translucent style
- Blends with app header

### Safe Areas
- Bottom tab bar respects iPhone notch
- Proper padding for all iPhone models

### App Title
- Shows "Cut Tracker" on home screen
- Custom icon with Japan flag emoji

## 🎯 Usage Tips

1. **Start with Settings**: Configure your plan first
2. **Daily Logging**: Log every morning after weighing in
3. **Meal Planning**: Build your meal library over time
4. **Use Pre-Built Plans**: Try the 7-day plan for simplicity
5. **Track Trends**: Check dashboard weekly for progress
6. **Stay Consistent**: Log daily for accurate projections

## 🐛 Troubleshooting

### App Not Installing
- Make sure you're using Safari (iPhone) or Chrome (Android)
- Check that all files are uploaded to the server
- Verify `manifest.json` is accessible

### Data Not Saving
- Check browser localStorage isn't disabled
- Make sure you're not in private/incognito mode
- Try clearing cache and reloading

### Icons Not Showing
- Run `generate-icons.html` to create icons
- Place icons in the `icons` folder
- Re-install the app after adding icons

## 🔄 Updates

To update the app after changes:
1. Make your edits to HTML/CSS/JS
2. Update version in `service-worker.js` (change `v1` to `v2`)
3. Reload the app
4. Service worker will update automatically

## 📝 License

Personal use project. Feel free to modify for your own fitness journey!

## 🤝 Credits

Built with:
- Vanilla JavaScript (no frameworks)
- CSS Grid & Flexbox
- HTML5 Canvas for charts
- localStorage for data persistence
- Service Workers for PWA functionality

---

**Good luck on your Japan cut! 💪🇯🇵**
