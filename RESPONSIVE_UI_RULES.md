# RESPONSIVE UI RULES FOR THIS PROJECT

Always structure all layouts to be fully responsive on all screen sizes (mobile, tablet, desktop).

Follow these principles across ALL files (HTML, JSX, TSX, CSS, Tailwind, or components):

## 1. Use FLEXBOX or GRID for all layouts

- Avoid absolute positioning unless absolutely necessary
- Prefer flex, grid, gap, justify-center, items-center, flex-col, etc.

## 2. Always use RESPONSIVE BREAKPOINTS

### For Tailwind:
- **mobile**: default (base styles)
- **sm**: ≥640px
- **md**: ≥768px
- **lg**: ≥1024px
- **xl**: ≥1280px

### For plain CSS:
Use media queries at:
- `480px` (small mobile)
- `768px` (tablet)
- `1024px` (desktop)
- `1280px` (large desktop)

## 3. Always ensure text, spacing, and images scale using flexible units

- Use `rem`, `%`, `vw`/`vh`
- Do NOT use fixed `px` for large layout elements
- Use responsive spacing: `px-4` (mobile) → `sm:px-6` → `md:px-8` → `lg:px-16`

## 4. Components must NEVER overflow on small screens

- Always wrap long text with `break-words` or `break-all`
- Use `max-width: 100%` or `w-full max-w-*`
- Images must use `width: 100%; height: auto` or `w-full h-auto`
- Containers should use `container mx-auto` or `max-w-*`

## 5. All pages require a MOBILE-FIRST design

- Start with mobile layout (base classes)
- Then enhance for larger screens with responsive classes or media queries
- Example: `px-4 sm:px-6 md:px-8 lg:px-16`

## 6. ALWAYS preview using multiple breakpoints when generating UI code

- If layout risks breaking on small screens, rewrite it automatically
- Test at: 320px, 640px, 768px, 1024px, 1280px

## 7. If generating cards, sections, grids, or forms

- Use `grid-cols-1` on mobile
- Use `sm:grid-cols-2` for tablets
- Use `lg:grid-cols-3` or `lg:grid-cols-4` on desktops

Example:
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {/* cards */}
</div>
```

## 8. NEVER hardcode widths or heights like `width: 400px` unless required

- Use `max-w-*` classes in Tailwind or responsive container sizes
- Prefer: `w-full`, `max-w-md`, `max-w-lg`, `max-w-xl`, etc.
- For fixed elements, use `max-w-[400px]` with responsive overrides

## 9. When creating new components

- Make them fully responsive by default
- Use `container`, `mx-auto`, `px-4` for proper spacing
- Always include mobile-first padding: `px-4 sm:px-6 md:px-8`

## 10. When editing existing code

- Fix and refactor any non-responsive or broken layout immediately
- Replace fixed sizes with flexible responsive styles
- Ensure all spacing scales properly across breakpoints

## Common Patterns

### Responsive Container
```tsx
<div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
  {/* content */}
</div>
```

### Responsive Grid
```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {/* items */}
</div>
```

### Responsive Text
```tsx
<h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl">
  Responsive Heading
</h1>
```

### Responsive Spacing
```tsx
<div className="py-8 sm:py-12 md:py-16 lg:py-24">
  {/* content */}
</div>
```

### Responsive Images
```tsx
<Image
  className="w-full h-auto max-w-full"
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
/>
```

## ALWAYS APPLY THESE RULES FOR EVERY UI CHANGE

If code violates these rules, correct it automatically.





