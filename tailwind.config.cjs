const defaultTheme = require('tailwindcss/defaultTheme');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: 'var(--aw-color-primary)',
        secondary: 'var(--aw-color-secondary)',
        accent: 'var(--aw-color-accent)',
        default: 'var(--aw-color-text-default)',
        muted: 'var(--aw-color-text-muted)',
      },
      fontFamily: {
        sans: ['var(--aw-font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--aw-font-serif)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--aw-font-heading)', ...defaultTheme.fontFamily.sans],
      },
    },
  },
  plugins: [require('@tailwindcss/typography'), require('flowbite/plugin'), require('taos/plugin')],
  darkMode: 'class',
  safelist: ['!duration-[0ms]', '!delay-[0ms]', 'html.js :where([class*="taos:"]:not(.taos-init))'],
  content: {
    relative: true,
    transform: (content) => content.replace(/taos:/g, ''),
    files: [
      './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
      './node_modules/flowbite/**/*.js',
      'node_modules/flowbite-react/lib/esm/**/*.js',
    ],
  },
};
