# Instruções do Projeto - Alfajoraria Andrey

## Regras Obrigatórias de Integração com Firebase
- O aplicativo utiliza EXCLUSIVAMENTE o projeto Firebase do próprio usuário, configurado unicamente através das variáveis de ambiente `VITE_FIREBASE_*` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`).
- NUNCA reintroduzir nenhuma integração automática, credencial provisionada pelo AI Studio ou `firebase-applet-config.json`.
- NUNCA passar segundo argumento (como `databaseId` personalizado) em `getFirestore(app)` em `src/services/firebase.ts`. Sempre chamar `getFirestore(app)` puro para conectar ao banco padrão `(default)` do projeto Firebase fornecido nas variáveis de ambiente.
- Não adicionar fallbacks para IDs ou projetos automáticos do AI Studio.
