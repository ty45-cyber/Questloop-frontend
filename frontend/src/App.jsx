// QuestLoop — App root: routing, auth gate, global layout

import { useEffect, useState } from "react";
import { StoreProvider, useStore } from "./lib/store";
import Nav from "./components/layout/Nav";
import Toast from "./components/ui/Toast";
import ConnectView    from "./views/ConnectView";
import ExploreView    from "./views/ExploreView";
import StreaksView    from "./views/StreaksView";
import LeaderboardView from "./views/LeaderboardView";
import DashboardView  from "./views/DashboardView";

function Router() {
  const { state } = useStore();
  const [view, setView] = useState("explore");

  // Redirect to connect if not authed
  useEffect(() => {
    if (!state.token && view !== "connect") setView("connect");
    if (state.token && view === "connect") setView("explore");
  }, [state.token]);

  const navigate = (v) => setView(v);

  const VIEW_MAP = {
    connect:     <ConnectView    onSuccess={() => setView("explore")} />,
    explore:     <ExploreView    />,
    streaks:     <StreaksView     />,
    leaderboard: <LeaderboardView />,
    dashboard:   <DashboardView  />,
  };

  return (
    <>
      {state.token && view !== "connect" && (
        <Nav currentView={view} onNavigate={navigate} />
      )}
      <main>{VIEW_MAP[view] || VIEW_MAP.explore}</main>
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Router />
    </StoreProvider>
  );
}