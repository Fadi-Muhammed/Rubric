/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — resolved from CSS variables (see index.css).
        canvas: "var(--canvas)",
        surface: "var(--surface)",
        elevated: "var(--elevated)",
        ink: "var(--ink)",
        secondary: "var(--secondary)",
        hairline: "var(--hairline)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
        },
        // AI-authenticity diverging scale (green human -> amber -> red AI)
        auth: {
          green: "var(--auth-green)",
          amber: "var(--auth-amber)",
          red: "var(--auth-red)",
        },
        skeleton: "var(--skeleton)",
      },
      fontFamily: {
        // Fraunces = display / big numbers ONLY. General Sans = all UI/body.
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"General Sans"', '"Satoshi"', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Locked scale: 12 / 14 / 16 / 20 / 28 / 40 / 56
        eyebrow: ["12px", { lineHeight: "1", letterSpacing: "0.1em" }],
        meta: ["14px", { lineHeight: "1.45" }],
        body: ["16px", { lineHeight: "1.5" }],
        h4: ["20px", { lineHeight: "1.3", letterSpacing: "-0.01em" }],
        h3: ["28px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        h2: ["40px", { lineHeight: "1", letterSpacing: "-0.02em" }],
        h1: ["56px", { lineHeight: "1", letterSpacing: "-0.03em" }],
      },
      borderRadius: {
        // 10-12 standard / 14 large surfaces / full for pills & dial
        md: "10px",
        lg: "12px",
        xl: "14px",
      },
      boxShadow: {
        // ONE soft ambient shadow — no stacked/heavy shadows.
        ambient: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
