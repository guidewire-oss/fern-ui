import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    // Filter only VITE_ variables
    const viteEnv = Object.entries(env).reduce<Record<string, string>>((acc, [key, val]) => {
        if (key.startsWith("VITE_")) {
            acc[`process.env.${key}`] = JSON.stringify(val || "");
        }
        return acc;
    }, {});

    return {
        plugins: [react()],
        define: {...viteEnv},
        server: {
            host: true,
            port: 9091
        },
        build: {
            rollupOptions: {
                external: ['@mui/material/Chip', '@mui/material/MenuItem'],
            },
        },
    };
});
