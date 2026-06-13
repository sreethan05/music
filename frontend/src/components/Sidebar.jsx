import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { 
  Home, 
  Search as SearchIcon, 
  Heart, 
  Library, 
  ChevronRight, 
  LogIn, 
  Menu, 
  Plus, 
  ListMusic 
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, albumsData, createEmptyPlaylist } = useContext(PlayerContext);

  const customPlaylists = albumsData.filter(album => album._id && album._id.startsWith("custom_playlist_"));

  const handleCreatePlaylistInline = () => {
    const name = prompt("Enter a name for your new playlist:");
    if (name && name.trim()) {
      const newPlaylist = createEmptyPlaylist(name.trim());
      if (newPlaylist && newPlaylist._id) {
        navigate(`/album/${newPlaylist._id}`);
      }
    }
  };

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
        <div className="flex flex-col gap-1.5">
          <div onClick={() => navigate("/")} className={itemClass("/")}>
            <Home className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Home</span>
          </div>

          <div onClick={() => navigate("/search")} className={itemClass("/search")}>
            <SearchIcon className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Search</span>
          </div>

          <div onClick={() => navigate("/profile")} className={itemClass("/profile")}>
            <Heart className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Liked Songs</span>
          </div>

          <div onClick={() => navigate("/profile")} className={itemClass("/albums")}>
            <Library className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>Albums</span>
          </div>

          {/* Playlist Creation Category */}
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-5 mb-2 pl-3">Playlists</span>

          <div 
            onClick={handleCreatePlaylistInline} 
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-2xl font-extrabold text-xs tracking-wide transition-all duration-200 text-slate-500 hover:text-slate-950 hover:bg-slate-100/50 cursor-pointer select-none"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5] text-amber-500" />
            <span>Create Playlist</span>
          </div>

          {/* List of custom playlists */}
          {customPlaylists.length > 0 && (
            <div className="flex flex-col gap-1 mt-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar border-t border-slate-100 pt-2">
              {customPlaylists.map(playlist => (
                <div
                  key={playlist._id}
                  onClick={() => navigate(`/album/${playlist._id}`)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all truncate cursor-pointer ${
                    location.pathname === `/album/${playlist._id}`
                      ? "bg-slate-100 text-slate-900"
                      : "text-slate-500 hover:text-slate-800 hover:bg-slate-50/55"
                  }`}
                  title={playlist.name}
                >
                  <ListMusic className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{playlist.name}</span>
                </div>
              ))}
            </div>
          )}
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
      {!user && (
        <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl shadow-sm">
          <p className="text-[11px] font-extrabold text-slate-800 leading-snug">Listening as guest</p>
          <p className="text-[9px] text-slate-400 font-bold leading-relaxed mt-1">Sign in to save playlists and favorites.</p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-3 w-full py-2.5 bg-slate-900 hover:bg-slate-950 text-white rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        </div>
      )}

    </div>
  );
};

export default Sidebar;
