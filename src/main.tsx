import { createRoot } from 'react-dom/client'
import '@fontsource/heebo';
import '@fontsource/assistant';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
