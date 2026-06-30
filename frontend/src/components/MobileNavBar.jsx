import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Home, Search, LayoutDashboard, User, ListMusic } from "lucide-react";

const MobileNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, openImportModal } = useContext(PlayerContext);

  const isActive = (path) => location.pathname === path;

  const tabClass = (active) =>
    `flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-200 w-16 ${
      active
        ? "text-sky-400 scale-105"
        : "text-theme-muted hover:text-theme-text"
    }`;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-spotify-light/90 backdrop-blur-xl border-t border-theme-border flex items-center justify-around px-4 z-40 select-none shadow-[0_-12px_30px_rgba(0,0,0,0.22)]">
      {/* Home Tab */}
      <button 
        onClick={() => navigate("/")}
        className={tabClass(isActive("/"))}
      >
        <Home className={`w-5 h-5 ${isActive("/") ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span className="text-[10px] font-bold tracking-tight">Home</span>
      </button>

      {/* Search Tab */}
      <button 
        onClick={() => navigate("/search")}
        className={tabClass(isActive("/search"))}
      >
        <Search className={`w-5 h-5 ${isActive("/search") ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span className="text-[10px] font-bold tracking-tight">Search</span>
      </button>

      {/* Import Playlist Tab */}
      <button 
        onClick={openImportModal}
        className={tabClass(false)}
      >
        <ListMusic className="w-5 h-5 stroke-[2]" />
        <span className="text-[10px] font-bold tracking-tight">Import</span>
      </button>

      {/* Admin Tab - Only visible to admin users */}
      {user && user.role === 'admin' && (
        <button 
          onClick={() => navigate("/admin")}
          className={tabClass(isActive("/admin"))}
        >
          <div className="relative">
            <LayoutDashboard className={`w-5 h-5 ${isActive("/admin") ? "stroke-[2.5]" : "stroke-[2]"}`} />
          </div>
          <span className="text-[10px] font-bold tracking-tight">Admin</span>
        </button>
      )}

      {/* Profile/Auth Tab */}
      <button 
        onClick={() => navigate(user ? "/profile" : "/auth")}
        className={tabClass(isActive("/profile") || isActive("/auth"))}
      >
        <User className={`w-5 h-5 ${isActive("/profile") || isActive("/auth") ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span className="text-[10px] font-bold tracking-tight">
          {user ? "Profile" : "Log In"}
        </span>
      </button>
    </div>
  );
};

export default MobileNavBar;
