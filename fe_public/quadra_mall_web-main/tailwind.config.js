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
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                muted: 'hsl(var(--muted))',
                'muted-foreground': 'hsl(var(--muted-foreground))',
                popover: 'hsl(var(--popover))',
                'popover-foreground': 'hsl(var(--popover-foreground))',
                card: 'hsl(var(--card))',
                'card-foreground': 'hsl(var(--card-foreground))',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                success: 'hsl(var(--success))',
                'success-foreground': 'hsl(var(--success-foreground))',
                warning: 'hsl(var(--warning))',
                'warning-foreground': 'hsl(var(--warning-foreground))',
            },
            animation: {
                fadeIn: 'fadeIn 1s ease-in-out',
            },
            keyframes: {
                fadeIn: {
                '0%': { opacity: 0 },
                '100%': { opacity: 1 },
                },
            },
        },
    },
    plugins: [],
};
