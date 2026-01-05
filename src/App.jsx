import { Routes, Route } from "react-router-dom";
import StartPage from "./pages/StartPage";
import CasualtyPage from "./pages/CasualtyPage";
import "./App.css";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<StartPage />} />
      <Route path="/casualty" element={<CasualtyPage />} />
    </Routes>
  );
}