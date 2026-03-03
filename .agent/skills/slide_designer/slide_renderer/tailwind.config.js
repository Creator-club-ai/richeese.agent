/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/**/*.{html,js}", "./src/**/*.{html,js}"],
    darkMode: 'class', // We use custom .theme-dark class mapping or dark mode explicitly
    theme: {
        extend: {
            colors: {
                bg: {
                    light: '#F4F4F0',
                    dark: '#1A1A1A',
                },
                text: {
                    primary: '#1A1A1A',
                    "primary-dark": '#FFFFFF',
                    secondary: '#666666',
                    "secondary-dark": '#AAAAAA',
                },
                accent: '#FF5100',
                borderC: { // Custom border colors
                    light: '#DADADA',
                    dark: '#333333',
                },
                boxBg: {
                    light: '#EFEFEB',
                    dark: '#2A2A2A',
                },
            },
            fontFamily: {
                sans: ['Pretendard', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
