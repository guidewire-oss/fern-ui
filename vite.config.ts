import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 9091
    },
    define: {
        'process.env': process.env
    },
    build: {
        rollupOptions: {
            external: ['@mui/material/Chip', '@mui/material/MenuItem'],
        },
    },
});