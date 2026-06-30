import { useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { 
  Home, 
  Search as SearchIcon, 
  Heart, 
  ChevronRight, 
  LogIn, 
  Plus, 
  ListMusic,
  AudioWaveform
} from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, albumsData, createEmptyPlaylist, openImportModal } = useContext(PlayerContext);

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
    return `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all duration-200 select-none cursor-pointer ${
      active
        ? "bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-sm shadow-slate-900/10 dark:shadow-white/5"
        : "text-theme-zinc hover:text-theme-text hover:bg-theme-border"
    }`;
  };

  return (
    <div className="w-[244px] h-full bg-spotify-light/95 border-r border-theme-border p-6 flex flex-col justify-between select-none hidden md:flex relative z-[15] transition-all duration-300">
      
      <div className="flex flex-col">
        {/* Brand Header */}
        <div 
          onClick={() => navigate("/")} 
          className="flex items-center gap-3 mb-9 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform duration-300">
            <AudioWaveform className="w-4.5 h-4.5" />
          </div>
          <span className="text-base font-black tracking-tight text-theme-text">
            Music <span className="text-sky-400 group-hover:text-amber-500 transition-colors">Vibe</span>
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

          {/* Playlist Creation Category */}
          <span className="text-[9px] font-black tracking-widest text-slate-400 uppercase mt-5 mb-2 pl-3">Playlists</span>

          <div 
            onClick={handleCreatePlaylistInline} 
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all duration-200 text-theme-zinc hover:text-theme-text hover:bg-theme-card cursor-pointer select-none"
          >
            <Plus className="w-4.5 h-4.5 stroke-[2.5] text-sky-400" />
            <span>Create Playlist</span>
          </div>

          <div 
            onClick={openImportModal} 
            className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-extrabold text-xs tracking-wide transition-all duration-200 text-theme-zinc hover:text-theme-text hover:bg-theme-card cursor-pointer select-none"
          >
            <ListMusic className="w-4.5 h-4.5 stroke-[2.2] text-sky-400" />
            <span>Import Playlist</span>
          </div>

          {/* List of custom playlists */}
          {customPlaylists.length > 0 && (
            <div className="flex flex-col gap-1 mt-2 max-h-[200px] overflow-y-auto pr-1 no-scrollbar border-t border-theme-border pt-2">
              {customPlaylists.map(playlist => (
                <div
                  key={playlist._id}
                  onClick={() => navigate(`/album/${playlist._id}`)}
                  className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all truncate cursor-pointer ${
                    location.pathname === `/album/${playlist._id}`
                      ? "bg-theme-border text-theme-text"
                      : "text-theme-zinc hover:text-theme-text hover:bg-theme-border/60"
                  }`}
                  title={playlist.name}
                >
                  <ListMusic className="w-3.5 h-3.5 text-theme-muted shrink-0" />
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
          className="flex items-center justify-between p-2.5 bg-theme-bg/60 border border-theme-border rounded-xl cursor-pointer hover:bg-theme-bg hover:border-theme-border-hover transition-all duration-200 group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-amber-400 flex items-center justify-center text-white font-extrabold text-[11px] shadow-sm select-none">
              {user.name ? user.name[0].toUpperCase() : "U"}
            </div>
            <div className="overflow-hidden w-[100px]">
              <h4 className="text-[11px] font-extrabold text-theme-text truncate">{user.name}</h4>
              <p className="text-[9px] text-theme-muted font-bold tracking-tight truncate mt-0.5">{user.email}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-theme-muted group-hover:text-theme-text transition-colors" />
        </div>
      )}
      {!user && (
        <div className="p-3 bg-theme-bg/60 border border-theme-border rounded-xl shadow-sm">
          <p className="text-[11px] font-extrabold text-theme-text leading-snug">Listening as guest</p>
          <p className="text-[9px] text-theme-muted font-bold leading-relaxed mt-1">Sign in to save playlists and favorites.</p>
          <button
            onClick={() => navigate("/auth")}
            className="mt-3 w-full py-2.5 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-950 dark:hover:bg-white text-white dark:text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer shadow-sm"
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
