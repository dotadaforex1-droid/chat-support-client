/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#060a12", // Deeper dark navy
                surface: "#0e1521",    // Card/Surface color
                foreground: "#ffffff",
                primary: {
                    DEFAULT: "#1199fa",  // Crypto.com Blue
                    hover: "#0082e6",
                    light: "#33abff",
                },
                secondary: {
                    DEFAULT: "#1e2329",
                    hover: "#2b3139",
                },
                accent: "#00d395",     // Success green
                muted: {
                    DEFAULT: "#848e9c",
                    foreground: "#474d57",
                },
                border: "rgba(255, 255, 255, 0.08)",
            },
            backgroundImage: {
                'crypto-gradient': 'linear-gradient(180deg, #060a12 0%, #0a1120 100%)',
                'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
            },
            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'blue-glow': '0 0 20px rgba(17, 153, 250, 0.15)',
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
        },
    },
    plugins: [],
}
