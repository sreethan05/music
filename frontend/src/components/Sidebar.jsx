import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { Home, TrendingUp, Rss, Disc, Calendar, Radio, Heart, Users, Library, ChevronRight, Menu } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(PlayerContext);

  const isActive = (path) => location.pathname === path;

  // Active styles helper
  const itemClass = (path) => {
    const active = isActive(path);
    return `flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs tracking-wide transition-all duration-200 select-none cursor-pointer ${
      active
        ? "bg-slate-900 text-white shadow-sm shadow-slate-900/10"
        : "text-slate-500 hover:text-slate-950 hover:bg-slate-100/50"
    }`;
  };

  return (
    <div className="w-[240px] h-full bg-white border-r border-slate-200/50 p-6 flex flex-col justify-between select-none hidden md:flex relative z-15">
      
      <div className="flex flex-col">
        {/* Top Window Control Dots & Menu Trigger */}
        <div className="flex items-center justify-between mb-7">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-400" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
          </div>
          <button className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer">
            <Menu className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Brand Header */}
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center gap-3 mb-8 cursor-pointer group"
        >
          <div className="w-7 h-7 flex items-center justify-center text-amber-500 hover:scale-105 transition-transform duration-300">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
              <path d="M12 2L4 7v10l8 5 8-5V7l-8-5z" />
              <path d="M12 6l5.2 3.2v6.4L12 18.8l-5.2-3.2V9.2L12 6z" fill="#fff" opacity="0.3" />
            </svg>
          </div>
          <span className="text-base font-black tracking-tight text-slate-800">
            Music <span className="text-amber-500 group-hover:text-amber-600 transition-colors">Vibe</span>
          </span>
        </div>

        {/* Navigation Menu Options */}
        <div className="flex flex-col gap-1">
          {/* Main items */}
          <div onClick={() => navigate("/")} className={itemClass("/")}>
            <Home className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Home</span>
          </div>

          <div onClick={() => navigate("/search")} className={itemClass("/search")}>
            <TrendingUp className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Trends</span>
          </div>

          <div onClick={() => navigate("/")} className={itemClass("/feed")}>
            <Rss className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Feed</span>
          </div>

          {/* Discover Category */}
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-5 mb-2 pl-3">Discover</span>
          
          <div onClick={() => navigate("/")} className={itemClass("/new-notable")}>
            <Disc className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>New and Notable</span>
          </div>
          
          <div onClick={() => navigate("/")} className={itemClass("/release-calendar")}>
            <Calendar className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Release Calendar</span>
          </div>

          <div onClick={() => navigate("/")} className={itemClass("/events")}>
            <Radio className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Events</span>
          </div>

          {/* Your Collection Category */}
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-5 mb-2 pl-3">Your Collection</span>

          <div onClick={() => navigate("/profile")} className={itemClass("/profile")}>
            <Heart className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Favorite Songs</span>
          </div>

          <div onClick={() => navigate("/")} className={itemClass("/artists")}>
            <Users className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Artist</span>
          </div>

          <div onClick={() => navigate("/profile")} className={itemClass("/albums")}>
            <Library className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Albums</span>
          </div>
        </div>
      </div>

      {/* Bottom User Card Profile */}
      {user && (
        <div 
          onClick={() => navigate("/profile")}
          className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100/80 hover:border-slate-200/50 transition-all duration-200 group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm select-none">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden w-[100px]">
              <h4 className="text-[11px] font-extrabold text-slate-800 truncate">{user.name}</h4>
              <p className="text-[9px] text-slate-400 font-bold tracking-tight truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </div>
      )}

    </div>
  );
};

export default Sidebar;
