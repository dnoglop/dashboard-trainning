// vite.config.js

import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react"; // Adicionei o plugin do React, pois seu projeto usa .tsx

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ".", "");
  return {
    plugins: [react()], // Necessário para projetos React
    define: {
      // Esta seção não é mais a forma principal de expor env vars com o prefixo VITE_
      // Mas pode ser mantida se você tiver outras variáveis sem o prefixo que precise.
      // O Vite já lida com `import.meta.env` automaticamente.
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"), // Apontei para a pasta 'src' que é mais comum
      },
    },
    server: {
      host: "0.0.0.0", // Permite que o servidor seja acessível externamente no Replit
      hmr: {
        clientPort: 443, // Garante que as atualizações automáticas funcionem no Replit
      },
      allowedHosts: [
        ".replit.dev", // Permite acesso de qualquer URL do Replit
      ],
    },
  };
});
