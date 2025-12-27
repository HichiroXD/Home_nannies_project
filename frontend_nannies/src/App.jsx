import './App.css'
import AppRouter from "@router/AppRouter";
import { useUserSync } from "@hooks/useUserSync";

export default function App() {
  // Sincronizar datos del usuario automáticamente
  useUserSync({ intervalMs: 5 * 60 * 1000 }); // Cada 5 minutos
  
  return <AppRouter />;
}