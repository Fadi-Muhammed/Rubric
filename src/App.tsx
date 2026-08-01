import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "@/components/app-shell";
import Dashboard from "@/pages/Dashboard";
import IntakeBuilder from "@/pages/IntakeBuilder";
import MatchPool from "@/pages/MatchPool";
import Allocation from "@/pages/Allocation";
import HiddenGems from "@/pages/HiddenGems";
import Apply from "@/pages/Apply";
import StyleGuide from "@/pages/StyleGuide";
import Debug from "@/pages/Debug";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Recruiter app — wrapped in the shell chrome */}
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/intake" element={<IntakeBuilder />} />
          <Route path="/match/:startupId" element={<MatchPool />} />
          <Route path="/allocation" element={<Allocation />} />
          <Route path="/gems" element={<HiddenGems />} />
          <Route path="/style" element={<StyleGuide />} />
          <Route path="/debug" element={<Debug />} />
        </Route>

        {/* Public candidate page — no chrome */}
        <Route path="/apply/:cycleId" element={<Apply />} />

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
