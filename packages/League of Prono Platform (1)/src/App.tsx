import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthPage } from "./components/AuthPage";
import { Dashboard } from "./components/Dashboard";
import { GroupView } from "./components/GroupView";
import { Profile } from "./components/Profile";
import { Friends } from "./components/Friends";
import { Shop } from "./components/Shop";
import { Header } from "./components/Header";
import { Toaster } from "./components/ui/sonner";

type View = "landing" | "auth" | "dashboard" | "group" | "profile" | "friends" | "shop";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("landing");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGetStarted = () => {
    setCurrentView("auth");
  };

  const handleLogin = (email: string, name: string) => {
    setIsAuthenticated(true);
    setCurrentView("dashboard");
  };

  const handleSelectGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setCurrentView("group");
  };

  const handleBackToDashboard = () => {
    setCurrentView("dashboard");
    setSelectedGroupId(null);
  };

  const handleNavigateToProfile = () => {
    setCurrentView("profile");
  };

  const handleNavigateToFriends = () => {
    setCurrentView("friends");
  };

  const handleNavigateToShop = () => {
    setCurrentView("shop");
  };

  const handleBackFromShop = () => {
    if (isAuthenticated) {
      setCurrentView("dashboard");
    } else {
      setCurrentView("landing");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView("landing");
    setSelectedGroupId(null);
  };

  const renderView = () => {
    // Boutique accessible sans authentification
    if (currentView === "shop") {
      return (
        <Shop 
          onBack={handleBackFromShop} 
          isAuthenticated={isAuthenticated}
          onLogin={handleGetStarted}
        />
      );
    }

    // Si non authentifié, afficher landing ou auth
    if (!isAuthenticated) {
      if (currentView === "auth") {
        return <AuthPage onLogin={handleLogin} />;
      }
      return <LandingPage onGetStarted={handleGetStarted} onNavigateToShop={handleNavigateToShop} />;
    }

    // Si authentifié, afficher l'app
    switch (currentView) {
      case "dashboard":
        return <Dashboard onSelectGroup={handleSelectGroup} onNavigateToFriends={handleNavigateToFriends} />;
      case "group":
        return selectedGroupId ? (
          <GroupView groupId={selectedGroupId} onBack={handleBackToDashboard} />
        ) : (
          <Dashboard onSelectGroup={handleSelectGroup} onNavigateToFriends={handleNavigateToFriends} />
        );
      case "profile":
        return <Profile onBack={handleBackToDashboard} />;
      case "friends":
        return <Friends onBack={handleBackToDashboard} />;
      default:
        return <Dashboard onSelectGroup={handleSelectGroup} onNavigateToFriends={handleNavigateToFriends} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {isAuthenticated && (
        <Header 
          onNavigateToProfile={handleNavigateToProfile}
          onNavigateToFriends={handleNavigateToFriends}
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToShop={handleNavigateToShop}
          onLogout={handleLogout}
          currentView={currentView}
        />
      )}
      
      <main>
        {renderView()}
      </main>

      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #E5E4E1",
          },
        }}
      />
    </div>
  );
}
