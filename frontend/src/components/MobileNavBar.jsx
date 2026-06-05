import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Home, Search, LayoutDashboard, User } from "lucide-react";

const MobileNavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(PlayerContext);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-[68px] bg-[#09090b]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 z-40 select-none pb-safe">
      {/* Home Tab */}
      <button 
        onClick={() => navigate("/")}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 w-16 ${
          isActive("/") 
            ? "text-spotify-green scale-105" 
            : "text-zinc-500 hover:text-white"
        }`}
      >
        <Home className={`w-5 h-5 ${isActive("/") ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span className="text-[10px] font-bold tracking-tight">Home</span>
      </button>

      {/* Search Tab */}
      <button 
        onClick={() => navigate("/search")}
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 w-16 ${
          isActive("/search") 
            ? "text-spotify-green scale-105" 
            : "text-zinc-500 hover:text-white"
        }`}
      >
        <Search className={`w-5 h-5 ${isActive("/search") ? "stroke-[2.5]" : "stroke-[2]"}`} />
        <span className="text-[10px] font-bold tracking-tight">Search</span>
      </button>

      {/* Admin Tab - Only visible to admin users */}
      {user && user.role === 'admin' && (
        <button 
          onClick={() => navigate("/admin")}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 w-16 ${
            isActive("/admin") 
              ? "text-spotify-green scale-105" 
              : "text-zinc-500 hover:text-white"
          }`}
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
        className={`flex flex-col items-center justify-center gap-1 cursor-pointer transition-all duration-300 w-16 ${
          isActive("/profile") || isActive("/auth")
            ? "text-spotify-green scale-105" 
            : "text-zinc-500 hover:text-white"
        }`}
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
