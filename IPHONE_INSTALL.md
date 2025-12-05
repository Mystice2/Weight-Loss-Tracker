# 📱 iPhone Installation Guide

## Complete Step-by-Step Guide to Install on iPhone

### Prerequisites
✅ iPhone with iOS 12 or later  
✅ Safari browser (not Chrome!)  
✅ Computer and iPhone on same WiFi  

---

## Method 1: Local Server (Easiest - No Internet Needed)

### Step 1: Start Local Server on Your Computer

**If you have Python (most Windows/Mac have it):**
```bash
1. Open Command Prompt (Windows) or Terminal (Mac)
2. Navigate to your project folder:
   cd "C:\Users\luay2\OneDrive\Desktop\HTML Projects\Weight Loss Journey"
3. Run: python -m http.server 8000
4. Leave this window open!
```

**If you have Node.js:**
```bash
1. Open Command Prompt
2. Navigate to project folder
3. Run: npx http-server -p 8000
4. Leave this window open!
```

### Step 2: Find Your Computer's IP Address

**On Windows:**
```bash
1. Open Command Prompt
2. Type: ipconfig
3. Look for "IPv4 Address" under your WiFi adapter
4. Example: 192.168.1.100
```

**On Mac:**
```bash
1. Open Terminal
2. Type: ifconfig | grep "inet "
3. Look for IP like 192.168.1.100
```

### Step 3: Install on iPhone

```
1. Make sure iPhone is on SAME WiFi as computer
2. Open Safari on iPhone
3. Type in address bar: http://YOUR-IP:8000
   Example: http://192.168.1.100:8000
4. Page should load!
5. Tap the Share button (square with arrow up)
6. Scroll down and tap "Add to Home Screen"
7. Edit name if you want (e.g., "Cut Tracker")
8. Tap "Add" in top right
9. App icon appears on home screen!
10. Tap icon to open app
11. Close Command Prompt on computer (server no longer needed)
```

---

## Method 2: GitHub Pages (Requires GitHub Account)

### Step 1: Upload to GitHub
```
1. Go to github.com
2. Create new repository: "japan-cut-tracker"
3. Upload all files from your project folder
4. Go to Settings → Pages
5. Enable GitHub Pages
6. Your URL: https://YOUR-USERNAME.github.io/japan-cut-tracker
```

### Step 2: Install from GitHub Pages
```
1. Open Safari on iPhone
2. Go to your GitHub Pages URL
3. Tap Share → Add to Home Screen
4. Tap Add
5. Done! App is installed
```

---

## Method 3: Other Web Hosts

You can also upload to:
- **Netlify** (drag & drop, free)
- **Vercel** (free, fast)
- **Firebase Hosting** (free)
- **Your own web server**

Then follow same steps: Safari → URL → Share → Add to Home Screen

---

## Verification Checklist

After installation, verify these work:

✅ **App opens in full screen** (no Safari UI)  
✅ **Status bar is dark** (blends with app)  
✅ **Bottom navigation works** (tap icons)  
✅ **Data saves** (add test entry, close app, reopen)  
✅ **Works offline** (turn off WiFi, still works)  
✅ **Icon looks good** (on home screen)  

---

## Troubleshooting

### "Cannot connect to server"
- ✅ Check computer and iPhone are on same WiFi
- ✅ Check IP address is correct
- ✅ Check server is still running
- ✅ Try adding `:8000` to end of IP

### "Add to Home Screen" option missing
- ✅ Make sure you're using Safari (not Chrome)
- ✅ Tap the Share button (not the menu)
- ✅ Scroll down in share menu

### App doesn't look right
- ✅ Make sure all files were uploaded
- ✅ Check styles.css is in same folder as index.html
- ✅ Try force refresh: hold and swipe down

### Icon is just a screenshot
- ✅ Generate icons using icon-generator.html
- ✅ Place both PNGs in icons/ folder
- ✅ Delete app from home screen
- ✅ Re-install

### Data not saving
- ✅ Don't use Private Browsing mode
- ✅ Make sure Storage isn't disabled
- ✅ Try: Settings → Safari → Clear History

### Status bar wrong color
- ✅ Check manifest.json is present
- ✅ Verify theme_color is set
- ✅ Re-install app

---

## Post-Installation Tips

### For Best Experience:
1. **Open app from home screen** (not Safari)
2. **Allow notifications** if prompted
3. **Don't delete app** - data is stored locally
4. **Backup data** periodically (Settings → screenshot)

### Daily Use:
1. **Morning**: Log weight right after waking up
2. **Throughout day**: Track meals in real-time
3. **Evening**: Verify daily totals
4. **Weekly**: Check Dashboard for trends

### Maintenance:
- **Update app**: Delete & re-install from same URL
- **Backup data**: Screenshot your Settings & History
- **Clear data**: Settings tab → Reset All Data

---

## Quick Reference

```
HOME SCREEN ICON
    ↓
  TAP TO OPEN
    ↓
FULL SCREEN APP
    ↓
WORKS OFFLINE
    ↓
ALL DATA SAVED
```

---

## Video Tutorial (Steps)

**If you were watching a video, here's what you'd see:**

```
00:00 - Open Command Prompt
00:05 - Navigate to folder
00:10 - Run: python -m http.server 8000
00:15 - Open new Command Prompt
00:20 - Run: ipconfig
00:25 - Copy IPv4 Address
00:30 - Open Safari on iPhone
00:35 - Type: http://192.168.1.100:8000
00:40 - Page loads!
00:45 - Tap Share button
00:50 - Tap "Add to Home Screen"
00:55 - Tap "Add"
01:00 - App icon appears!
01:05 - Tap to open
01:10 - Full screen app!
01:15 - Done! 🎉
```

---

## Advanced: Auto-Update Setup

Want app to auto-update when you make changes?

1. Keep files on GitHub
2. Install from GitHub Pages URL
3. Edit files on computer
4. Push to GitHub
5. App auto-updates on next open!

---

## Still Need Help?

Common issues and solutions:

| Issue | Solution |
|-------|----------|
| Can't find IP | Run `ipconfig` on Windows, `ifconfig` on Mac |
| Server won't start | Install Python from python.org |
| Page won't load | Check firewall isn't blocking port 8000 |
| Icon is blank | Generate icons first using icon-generator.html |
| App keeps opening Safari | Re-install from home screen icon, not Safari |

---

## Success! 🎉

Once installed, you have a real app that:
- ✅ Opens instantly
- ✅ Works offline
- ✅ Saves all data
- ✅ Updates in real-time
- ✅ Feels native

**You're ready to crush your Japan cut!** 💪🇯🇵

---

*For more help, see: README.md and QUICK_START.md*
