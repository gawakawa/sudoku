---
paths: "**/*.css, **/*.purs"
---

# CSS / Styling Rules

- Use Tailwind CSS utility classes (in the `class` fields of `.purs` files) for styling, not custom CSS in `style.css`
- Keep `style.css` minimal: only Tailwind directives, `@source` and essential global styles
- Prefer Tailwind's built-in utilities over custom CSS classes
- Tailwind v4 has no `tailwind.config.js`; custom values go in `style.css` (`@theme` or CSS variables)
- Class names must appear as complete string literals in `.purs` files, since Tailwind finds them by scanning the source (`@source "./src/**/*.purs"`)
