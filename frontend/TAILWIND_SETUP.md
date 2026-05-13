# Tailwind CSS Setup Guide

## ✅ Installation Complete

Tailwind CSS has been successfully installed and configured for your React project.

---

## 📦 What Was Installed

### Dependencies
- **tailwindcss** (^4.1.18) - Utility-first CSS framework
- **postcss** (^8.5.6) - CSS processing tool
- **autoprefixer** (^10.4.23) - Vendor prefix automation

### Configuration Files Created
1. **tailwind.config.js** - Main Tailwind configuration
2. **postcss.config.js** - PostCSS configuration
3. **index.css** - Updated with Tailwind directives

---

## 🎨 Theme Configuration

The custom theme includes:

### Colors
```
Primary Green Colors (custom):
- primary-50 to primary-900 (from #f0fdf4 to #145231)

Secondary Blue Colors (custom):
- secondary-50 to secondary-900 (from #eff6ff to #1e3a8a)

Dark Colors (custom):
- dark-50 to dark-900 (from #f9fafb to #111827)
```

### Custom Utilities
```
Shadows:
- shadow-soft: 0 4px 12px rgba(0, 0, 0, 0.05)
- shadow-medium: 0 8px 20px rgba(16, 185, 129, 0.1)
- shadow-heavy: 0 16px 40px rgba(16, 185, 129, 0.12)

Animations:
- animate-slide-down: 0.3s smooth slide down
- animate-fade-in: 0.3s fade in animation
```

---

## 🚀 Getting Started

### Start Development Server
```bash
cd frontend
npm run dev
```

If port 3000 is already in use, respond with `Y` to use another port.

### Build for Production
```bash
npm run build
```

### Run Tests
```bash
npm test
```

---

## 💡 Using Tailwind CSS in Your Components

### Basic Usage
```jsx
// Simple button
<button className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-all">
  Click Me
</button>

// Card with custom shadow
<div className="bg-white rounded-lg shadow-medium p-6">
  Content goes here
</div>

// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* items */}
</div>
```

### Combining with Existing CSS
Tailwind classes work alongside your custom CSS classes:
```jsx
<div className="custom-class bg-primary-50 p-4 rounded">
  This element uses both Tailwind and custom CSS
</div>
```

### Custom Components with @apply
```css
/* In your CSS file */
@layer components {
  .btn-primary {
    @apply bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-all;
  }
}
```

Then use it:
```jsx
<button className="btn-primary">Click Me</button>
```

---

## 📁 File Structure

```
frontend/
├── src/
│   ├── index.css (Updated with Tailwind directives)
│   ├── index.jsx
│   ├── App.jsx
│   ├── pages/
│   ├── components/
│   ├── styles/
│   └── ...
├── public/
├── tailwind.config.js (NEW - Tailwind configuration)
├── postcss.config.js (NEW - PostCSS configuration)
├── package.json (Updated with Tailwind dependencies)
└── package-lock.json
```

---

## 🎯 Tailwind Quick Reference

### Common Classes

**Text**
```
text-xs, text-sm, text-base, text-lg, text-xl, text-2xl...
font-thin, font-light, font-normal, font-semibold, font-bold, font-black
text-primary-600, text-secondary-500, text-dark-700
```

**Spacing** (padding, margin)
```
p-2, p-4, p-6, p-8 (padding)
m-2, m-4, m-6, m-8 (margin)
gap-2, gap-4, gap-6 (grid/flex gap)
```

**Sizing**
```
w-1/2, w-1/3, w-full
h-32, h-64, h-screen
max-w-md, max-w-lg, max-w-2xl
```

**Colors**
```
bg-primary-50, bg-primary-100, bg-primary-600, bg-primary-900
text-secondary-600
border-dark-200
hover:bg-primary-700 (hover state)
```

**Borders & Radius**
```
border, border-2, border-4
rounded, rounded-lg, rounded-full
border-primary-200, border-secondary-300
```

**Flexbox & Grid**
```
flex, flex-col, flex-row
justify-center, justify-between, items-center
grid, grid-cols-2, grid-cols-3, lg:grid-cols-4
gap-4, gap-6
```

**Responsive**
```
sm:, md:, lg:, xl:, 2xl:
Example: md:grid-cols-2 lg:grid-cols-3
```

**Transitions & Effects**
```
transition-all, transition-colors, transition-transform
duration-200, duration-300
hover:, focus:, active:
```

---

## 🔧 Customization

### Add Custom Colors

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      brand: '#1234ff',
    }
  }
}
```

Then use:
```jsx
<div className="bg-brand text-brand">...</div>
```

### Add Custom Fonts

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    fontFamily: {
      'display': ['Playfair Display', 'serif'],
    }
  }
}
```

### Add Custom Breakpoints

Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    screens: {
      'xs': '320px',
      '2xl': '1400px',
    }
  }
}
```

---

## ⚡ Performance Tips

1. **Production Build**: Tailwind automatically removes unused styles in production builds
2. **Content Configuration**: Update the `content` array in `tailwind.config.js` to include all template files
3. **Class Names**: Use static class names (not dynamic string concatenation)
   ```jsx
   // ✅ Good
   <div className={`p-4 ${isActive ? 'bg-primary-600' : 'bg-gray-200'}`} />
   
   // ❌ Avoid
   <div className={`p-${size}`} /> // Dynamic values won't be detected
   ```

---

## 🐛 Troubleshooting

### Tailwind Styles Not Showing
1. Check that `@tailwind` directives are in `src/index.css`
2. Verify `content` paths in `tailwind.config.js`
3. Restart development server
4. Clear browser cache (Ctrl+Shift+Delete)

### Classes Being Removed in Production
- Ensure file paths in `content` array match your project structure
- Check for dynamic class names (they won't be detected)

### PostCSS Errors
1. Verify `postcss.config.js` exists in root folder
2. Check for syntax errors in the file
3. Run `npm install` again if postcss-loader has issues

### Build Takes Too Long
- This is normal for first build with Tailwind
- Subsequent builds will be cached and faster

---

## 📚 Resources

- **Official Docs**: https://tailwindcss.com/docs
- **Config Reference**: https://tailwindcss.com/docs/configuration
- **Utility Classes**: https://tailwindcss.com/docs/utility-first
- **Responsive Design**: https://tailwindcss.com/docs/responsive-design
- **Dark Mode**: https://tailwindcss.com/docs/dark-mode

---

## ✨ Next Steps

1. **Start Building**: Use Tailwind classes in your components
2. **Replace Custom CSS**: Gradually migrate existing styles to Tailwind
3. **Create Reusable Components**: Use `@apply` for repeated patterns
4. **Customize Theme**: Extend the theme for your brand colors and typography

---

## 🔄 Converting Existing CSS to Tailwind

Instead of:
```css
.button {
  background-color: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}
.button:hover {
  background-color: #16a34a;
}
```

Use:
```jsx
<button className="bg-primary-500 text-white px-4 py-2 rounded-md hover:bg-primary-600 transition-colors">
  Button
</button>
```

---

**Version**: 1.0  
**Installed**: January 9, 2026  
**Status**: ✅ Ready to Use
