module.exports = {
  plugins: {
    // fitness-app styles.css uses Tailwind v4 (`@import "tailwindcss"`).
    // The classic `tailwindcss` PostCSS plugin is v3 and rejects that CSS.
    "@tailwindcss/postcss": {},
    autoprefixer: {},
  },
};
