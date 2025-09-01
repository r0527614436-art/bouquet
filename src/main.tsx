import { createRoot } from 'react-dom/client'
import '@fontsource/heebo';
import '@fontsource/assistant';
import '@fontsource/varela-round';
import '@fontsource/amatic-sc';
import App from './App.tsx'
import './index.css'

createRoot(document.getElementById("root")!).render(<App />);
