/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}', // Quét tất cả file trong src/
    ],
    theme: {
        extend: {
            colors: {
                primary: '#2563eb',
                'primary-foreground': '#ffffff',
                destructive: '#dc2626',
                'destructive-foreground': '#ffffff',
                accent: '#f3f4f6',
                'accent-foreground': '#111827',
                secondary: '#6b7280',
                'secondary-foreground': '#ffffff',
                navy: '#1E2753'
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
};