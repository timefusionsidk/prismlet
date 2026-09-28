import {defineConfig} from 'vite';import react from '@vitejs/plugin-react';import tw from '@tailwindcss/vite';
export default defineConfig({plugins:[react(),tw()],worker:{format:'es'},build:{target:'es2022'}});
