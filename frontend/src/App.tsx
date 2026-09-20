import { BrowserRouter, Link, Route, Routes, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AppLayout from "./layouts/AppLayout";
import { AuthPage } from "./pages/AuthPage";
import { HomePage } from "./pages/HomePage";
import { CitySearch } from "./components/CitySearch";
import { CityPage } from "./pages/CityPage";

function UserNav() {
  const { user, logout, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading || location.pathname === "/login") {
    return null;
  }

  if (!user) {
    return (
      <Link
        to="/login"
        className="inline-flex items-center justify-center text-xs font-medium text-text-muted hover:text-accent-blue bg-bg-card hover:bg-bg-card-hover border border-border-light hover:border-accent-blue/50 px-3 py-1.5 rounded-lg transition-all"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center justify-end gap-3">
      <span className="text-xs font-medium text-text-secondary">
        {user.username}
      </span>
      <button
        type="button"
        onClick={logout}
        className="inline-flex items-center justify-center text-xs text-text-muted hover:text-accent-red px-2.5 py-1.5 rounded-lg border border-border-default hover:border-accent-red/30 transition-all cursor-pointer"
      >
        Sign Out
      </button>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            element={
              <AppLayout
                centerSlot={<CitySearch />}
                rightSlot={<UserNav />}
              />
            }
          >
            <Route path="/" element={<HomePage />} />
            <Route path="/city/:name" element={<CityPage />} />
            <Route path="/login" element={<AuthPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

