import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { ChevronLeft, ChevronRight, Download, LogIn, LogOut, LayoutDashboard, UserCheck, Sun, Moon, Search } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutUser, theme, toggleTheme, searchQuery, setSearchQuery } = useContext(PlayerContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [installLabel, setInstallLabel] = useState("Install App");

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
      setInstallLabel("Install App");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  const handleLogout = () => {
    logoutUser();
    setDropdownOpen(false);
    navigate("/");
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    // If they aren't on the Home page or Search page, navigate to Home so they can see the filtered song table!
    if (location.pathname !== "/" && location.pathname !== "/search") {
      navigate("/");
    }
  };

  const handleInstall = async () => {
    if (!installPrompt) {
      setInstallLabel("Browser Ready");
      window.setTimeout(() => setInstallLabel("Install App"), 1800);
      return;
    }

    await installPrompt.prompt();
    setInstallPrompt(null);
  };

  return (
    <div className="w-full flex items-center justify-between py-3 mb-4 md:mb-6 select-none relative z-[35] bg-transparent">
      {/* Navigation Arrows */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => navigate(-1)} 
          className="w-9 h-9 flex items-center justify-center bg-theme-card border border-theme-border hover:bg-theme-border text-theme-text rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Back"
        >
          <ChevronLeft className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
        <button 
          onClick={() => navigate(1)} 
          className="w-9 h-9 flex items-center justify-center bg-theme-card border border-theme-border hover:bg-theme-border text-theme-text rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          title="Forward"
        >
          <ChevronRight className="w-4.5 h-4.5 stroke-[2.2]" />
        </button>
      </div>

      {/* Mockup Middle Search Input (Functional & Synchronized) */}
      <div className="flex-1 max-w-[420px] mx-3 sm:mx-4 relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-muted group-focus-within:text-theme-text transition-colors w-4 h-4" />
        <input 
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search songs, artists, or albums"
          className="w-full bg-theme-card border border-theme-border text-theme-text placeholder:text-theme-muted text-xs pl-11 pr-4 py-2.5 rounded-full focus:outline-none focus:border-theme-border-hover focus:ring-1 focus:ring-theme-border transition-all font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.015)]"
        />
      </div>

      {/* Action Controls: Install, Theme, Profile */}
      <div className="flex items-center gap-3 relative">
        <button
          onClick={handleInstall}
          className="hidden sm:flex px-4 py-2.5 bg-theme-card border border-theme-border hover:bg-theme-border text-theme-text text-xs font-black rounded-full hover:scale-105 active:scale-95 transition-all duration-200 items-center gap-2 cursor-pointer shadow-sm"
          title="Install Music Vibe"
        >
            <Download className="w-3.5 h-3.5 text-sky-400" />
          <span>{installLabel}</span>
        </button>

        {/* Theme Switcher Toggle */}
        <button 
          onClick={toggleTheme}
          className="w-9 h-9 flex items-center justify-center bg-theme-card border border-theme-border hover:bg-theme-border text-theme-text rounded-full hover:scale-105 active:scale-95 transition-all shadow-sm cursor-pointer"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <Moon className="w-4.5 h-4.5 stroke-[2.2]" />
          ) : (
            <Sun className="w-4.5 h-4.5 stroke-[2.2]" />
          )}
        </button>

        {/* User Profile dropdown menu (Guaranteed user object via gated auth) */}
        {user ? (
          <div className="relative">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 bg-gradient-to-tr from-sky-400 to-amber-400 rounded-full flex items-center justify-center text-white hover:scale-105 active:scale-95 transition-all shadow-sm relative group cursor-pointer"
              title="Account"
            >
              <span className="font-extrabold text-xs">{user.name ? user.name[0].toUpperCase() : "U"}</span>
            </button>

            {/* Profile Dropdown Panel */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2.5 w-56 bg-spotify-light rounded-2xl p-2 border border-theme-border shadow-[0_15px_40px_rgba(0,0,0,0.15)] z-50">
                <div className="px-3.5 py-3 border-b border-theme-border">
                  <p className="text-xs font-extrabold text-theme-text truncate">{user.name}</p>
                  <p className="text-[10px] text-theme-muted font-bold truncate mt-0.5">{user.email}</p>
                  {user.role === 'admin' ? (
                    <span className="text-[8.5px] bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 px-2 py-0.5 rounded-full inline-block mt-2 font-black uppercase tracking-wider">Admin Role</span>
                  ) : (
                    <span className="text-[8.5px] bg-theme-border text-theme-muted border border-theme-border px-2 py-0.5 rounded-full inline-block mt-2 font-black uppercase tracking-wider">Listener Role</span>
                  )}
                </div>
                
                <div className="flex flex-col gap-0.5 mt-1.5">
                  {user.role === 'admin' && (
                    <button 
                      onClick={() => { navigate("/admin"); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-theme-zinc hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer text-left"
                    >
                      <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                      <span>Admin Control Panel</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-theme-zinc hover:text-theme-text hover:bg-theme-border transition-colors cursor-pointer text-left"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-500" />
                    <span>My Dashboard</span>
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button 
            onClick={() => navigate("/auth")}
            className="px-4 py-2.5 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-950 dark:hover:bg-white text-white dark:text-zinc-950 text-xs font-black rounded-full hover:scale-105 active:scale-95 transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-sm shadow-slate-900/10"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign In</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
