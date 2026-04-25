import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { Pay } from "./pages/Pay";
import { Receive } from "./pages/Receive";
import { Activity } from "./pages/Activity";
import { AgentDemo } from "./pages/AgentDemo";

function AppLayout() {
  return (
    <div className="max-w-md mx-auto min-h-screen border-x border-[var(--glass-border)] bg-void-900 relative shadow-2xl overflow-hidden">
      <Outlet />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="pay" element={<Pay />} />
          <Route path="receive" element={<Receive />} />
          <Route path="activity" element={<Activity />} />
          <Route path="agent" element={<AgentDemo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
