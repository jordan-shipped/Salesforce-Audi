# Design System Migration Guide

## 🎯 Overview
This guide outlines the new unified design system that replaces hardcoded values and inconsistent styling patterns with a token-based approach using Tailwind CSS.

## 📁 File Structure
```
src/
├── styles/
│   └── utilities.css          # Design token utilities & component classes
├── designTokens.js            # Legacy (keep for reference)
├── index.css                  # Global styles & CSS variables
└── tailwind.config.js         # Tailwind configuration with tokens
```

## 🎨 Design Tokens Usage

### Colors
```jsx
// ❌ Before (hardcoded)
style={{ color: '#007AFF' }}
className="text-blue-500"

// ✅ After (design tokens)
className="text-accent"
className="bg-background-card"
className="border-border-subtle"
```

### Typography
```jsx
// ❌ Before (hardcoded)
style={{ fontSize: '16px', fontWeight: '600' }}

// ✅ After (design tokens)
className="text-body-large font-semibold"
className="text-hero font-bold"
className="text-caption font-regular"
```

### Spacing
```jsx
// ❌ Before (hardcoded)
style={{ padding: '16px', margin: '24px' }}

// ✅ After (design tokens)
className="p-md m-lg"
className="px-lg py-2"
className="gap-4 space-y-6"
```

## 🔧 Component Classes

### Buttons
```jsx
// ❌ Before
<button style={{...complexInlineStyles}} />

// ✅ After
<button className="btn-primary" />
<button className="btn-secondary" />
<button className="btn-text" />
```

### Cards
```jsx
// ❌ Before
<div style={{...cardStyles}} />

// ✅ After
<div className="card" />
<div className="card-hover" />
<div className="card-elevated" />
```

### Inputs
```jsx
// ❌ Before
<input style={{...inputStyles}} />

// ✅ After
<input className="input" />
<label className="input-label" />
```

### Layout Components
```jsx
// ✅ Use these layout classes
<div className="container-page">     // Max-width container
<div className="section-spacing">    // Vertical section spacing
<div className="content-spacing">    // Content spacing
<div className="hero-section">       // Landing page hero
<div className="features-grid">      // Feature grid layout
```

## 📋 Component Patterns

### Stage Summary Panel
```jsx
<div className="stage-panel">
  <div className="stage-header">
    <span className="stage-tag">Stage 1</span>
    <h1 className="stage-title">Business Title</h1>
    <span className="stage-role">Role</span>
  </div>
  <div className="stats-grid">
    <div className="stat-card">
      <div className="stat-label">Label</div>
      <div className="stat-value">Value</div>
    </div>
  </div>
</div>
```

### Accordion Card
```jsx
<div className="accordion-card">
  <button className="accordion-header">
    <div className="accordion-header-left">
      <span className="domain-badge">Domain</span>
      <span className="text-body-medium">Title</span>
    </div>
    <div className="accordion-header-right">
      <span className="priority-high">High</span>
    </div>
  </button>
</div>
```

### Modal
```jsx
<div className="modal-overlay">
  <div className="modal">
    <button className="modal-close">×</button>
    <div className="modal-title">Title</div>
    <div className="modal-content">Content</div>
  </div>
</div>
```

## 🚨 Migration Rules

### DO ✅
- Use design token classes: `text-accent`, `bg-background-card`
- Use component classes: `btn-primary`, `card`, `input`
- Use spacing tokens: `p-md`, `gap-lg`, `space-y-6`
- Use typography classes: `text-hero`, `text-body-large`
- Follow the 8px grid system: `space-4`, `space-8`, `space-16`

### DON'T ❌
- Hardcode colors: `#007AFF`, `color: blue`
- Hardcode sizes: `fontSize: '16px'`, `padding: '12px'`
- Create new CSS classes without tokens
- Use inline styles for design values
- Mix different spacing systems

## 🔍 Priority Classes
```jsx
className="priority-high"     // Red background
className="priority-medium"   // Yellow background  
className="priority-low"      // Green background
```

## 📱 Responsive Patterns
```jsx
// Use Tailwind responsive prefixes with our tokens
className="text-body-regular md:text-body-large"
className="p-md lg:p-lg"
className="grid grid-cols-1 md:grid-cols-3"
```

## 🎯 Common Migrations

### Replace App.css Classes
```jsx
// ❌ Before
className="HeroTitle"
className="FeatureCard" 
className="StageTag"

// ✅ After  
className="hero-title"
className="feature-card"
className="stage-tag"
```

### Replace Inline Styles
```jsx
// ❌ Before
style={{ 
  fontSize: '18px',
  color: '#1C1C1E', 
  padding: '16px',
  borderRadius: '12px'
}}

// ✅ After
className="text-h2 text-text-black p-md rounded-md"
```

## 🧪 Testing Components
After migration, verify:
- [ ] Colors match design specifications
- [ ] Typography scales correctly
- [ ] Spacing follows 8px grid
- [ ] Hover states work properly
- [ ] Focus states are accessible
- [ ] Mobile responsiveness maintained

## 📚 Reference
- **Tailwind Config**: `frontend/tailwind.config.js`
- **Utilities**: `frontend/src/styles/utilities.css`
- **CSS Variables**: `frontend/src/index.css`
- **Design Tokens**: `frontend/src/designTokens.js` (legacy reference)

---

**Next Steps**: 
1. Migrate remaining App.js components
2. Remove unused CSS from App.css
3. Set up linting rules to prevent regression
4. Update team documentation