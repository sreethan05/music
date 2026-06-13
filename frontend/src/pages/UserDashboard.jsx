import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { PlayerContext } from "../context/PlayerContext";
import { 
  User, 
  Music, 
  Trash2, 
  Play, 
  Pause, 
  Sliders, 
  Sparkles, 
  LogOut,
  ShieldCheck,
  Disc,
  Sun,
  Moon
} from "lucide-react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { 
    user, 
    logoutUser, 
    albumsData, 
    playWithId, 
    currentSong, 
    playStatus, 
    togglePlay,
    theme,
    setTheme,
    deletePlaylist
  } = useContext(PlayerContext);

  const [ambientIntensity, setAmbientIntensity] = useState("high");

  // Authentication guard
  if (!user) {
    return (
      <div className="flex-1 h-full flex flex-col items-center justify-center bg-[#09090b] text-zinc-400 select-none">
        <Disc className="w-12 h-12 text-zinc-650 animate-spin mb-4" />
        <p className="font-semibold text-sm">Please log in to view your listener panel.</p>
        <button 
          onClick={() => navigate("/auth")}
          className="mt-4 px-6 py-2.5 bg-white text-black font-extrabold text-xs tracking-wider uppercase rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Get custom playlists
  const customPlaylists = albumsData.filter(album => album._id.startsWith("custom_playlist_"));
  const totalTracks = customPlaylists.reduce((acc, curr) => acc + (curr.tracks?.length || 0), 0);

  const handleDeletePlaylist = (playlistId, name, e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete the playlist "${name}"?`)) {
      deletePlaylist(playlistId);
    }
  };

  const handlePlaylistPlay = (playlist, e) => {
    e.stopPropagation();
    if (playlist.tracks && playlist.tracks.length > 0) {
      const firstSong = playlist.tracks[0];
      // Check if current playing song is already part of this playlist
      if (currentSong && playlist.tracks.some(s => s._id === currentSong._id)) {
        togglePlay();
      } else {
        playWithId(firstSong._id, playlist.tracks);
      }
    } else {
      alert("This playlist has no songs yet.");
    }
  };

  const handleClearAllPlaylists = () => {
    if (confirm("Are you sure you want to delete all your custom playlists? This action cannot be undone.")) {
      localStorage.removeItem('custom_playlists');
      window.location.reload();
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto pb-36 md:pb-28 bg-theme-bg px-6 no-scrollbar relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient background glows */}
      <div className="ambient-glow top-[-100px] left-[-50px] opacity-40" />
      <div className="ambient-glow-purple top-[400px] right-[-100px] opacity-35" />

      {/* Dashboard Title */}
      <div className="mt-6 mb-8 select-none relative z-10">
        <h2 className="text-3xl font-extrabold tracking-tight text-white glow-text flex items-center gap-3">
          <User className="w-7 h-7 text-spotify-green stroke-[2.5]" />
          <span>Listener Panel</span>
        </h2>
        <p className="text-xs text-theme-zinc mt-1.5 font-medium">Manage your personal collection, view listening stats, and customize settings.</p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
        
        {/* Left Side: Profile Information & Settings */}
        <div className="lg:col-span-1 flex flex-col gap-6 select-none">
          {/* PROFILE CARD */}
          <div className="glass-panel p-6 rounded-2xl border border-theme-border shadow-xl relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-0 right-0 w-24 h-24 bg-spotify-green/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-spotify-green to-emerald-400 flex items-center justify-center text-black mb-4 relative shadow-md">
              <User className="w-7 h-7 text-black stroke-[2.5]" />
            </div>

            <h3 className="font-extrabold text-theme-text text-lg tracking-tight truncate max-w-full">{user.name}</h3>
            <p className="text-xs text-theme-zinc font-semibold mt-0.5 truncate max-w-full">{user.email}</p>
            
            {user.role === 'admin' ? (
              <span className="text-[9px] bg-spotify-green/10 text-spotify-green border border-spotify-green/20 px-3.5 py-1 rounded-full font-extrabold uppercase tracking-widest mt-4 flex items-center gap-1.5 shadow-[0_0_10px_rgba(29,185,84,0.1)]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Manager</span>
              </span>
            ) : (
              <span className="text-[9px] bg-theme-card text-theme-zinc border border-theme-border px-3.5 py-1 rounded-full font-extrabold uppercase tracking-widest mt-4">
                Premium Listener
              </span>
            )}

            <div className="w-full h-px bg-theme-border my-5" />

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 gap-4 w-full text-center">
              <div className="p-3 bg-theme-card border border-theme-border rounded-xl">
                <span className="text-xl font-black text-theme-text tracking-tight">{customPlaylists.length}</span>
                <p className="text-[9px] text-theme-zinc font-bold uppercase tracking-wider mt-0.5">Playlists</p>
              </div>
              <div className="p-3 bg-theme-card border border-theme-border rounded-xl">
                <span className="text-xl font-black text-theme-text tracking-tight">{totalTracks}</span>
                <p className="text-[9px] text-theme-zinc font-bold uppercase tracking-wider mt-0.5">Tracks</p>
              </div>
            </div>
            
            <button 
              onClick={() => { logoutUser(); navigate("/"); }}
              className="w-full py-3 bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 text-xs font-extrabold uppercase tracking-wider rounded-xl mt-5 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>

          {/* DASHBOARD SETTINGS PANEL */}
          <div className="glass-panel p-6 rounded-2xl border border-theme-border shadow-xl relative overflow-hidden flex flex-col gap-4">
            <h3 className="font-extrabold text-theme-text text-sm tracking-tight flex items-center gap-2 mb-1">
              <Sliders className="w-4 h-4 text-spotify-green" />
              <span>Interface Settings</span>
            </h3>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-theme-zinc uppercase tracking-wide block">Ambient Glow Intensity</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {["low", "medium", "high"].map((level) => (
                  <button 
                    key={level}
                    onClick={() => setAmbientIntensity(level)}
                    className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer ${
                      ambientIntensity === level 
                        ? "bg-spotify-green text-black border-spotify-green shadow-md shadow-spotify-green/10" 
                        : "bg-theme-card border-theme-border text-theme-zinc hover:text-theme-text"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-px bg-theme-border my-1" />

            {/* Color Theme switcher settings block */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-theme-zinc uppercase tracking-wide block">App Color Theme</label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {[
                  { value: "light", label: "Light Theme", icon: Sun },
                  { value: "dark", label: "Dark Theme", icon: Moon }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button 
                      key={item.value}
                      onClick={() => setTheme(item.value)}
                      className={`py-1.5 px-3 rounded-lg text-[10px] font-extrabold uppercase tracking-wider border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        theme === item.value 
                          ? "bg-spotify-green text-black border-spotify-green shadow-md shadow-spotify-green/10" 
                          : "bg-theme-card border-theme-border text-theme-zinc hover:text-theme-text"
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="w-full h-px bg-theme-border my-1" />

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-extrabold text-theme-zinc uppercase tracking-wide block">Library Control</label>
              <button 
                onClick={handleClearAllPlaylists}
                disabled={customPlaylists.length === 0}
                className="w-full py-2.5 bg-rose-550/5 hover:bg-rose-550/10 border border-rose-550/10 text-rose-400 text-xs font-extrabold rounded-lg disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
              >
                Clear Playlists Cache
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Playlists Management */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="glass-panel rounded-2xl p-6 border border-theme-border shadow-xl min-h-[400px] flex flex-col">
            
            {/* Section Header */}
            <div className="flex items-center justify-between border-b border-theme-border pb-4 mb-4 select-none">
              <h3 className="font-extrabold text-theme-text text-base tracking-tight flex items-center gap-2">
                <Music className="w-5 h-5 text-spotify-green" />
                <span>My Custom Playlists ({customPlaylists.length})</span>
              </h3>
              
              <button 
                onClick={() => navigate("/search")}
                className="text-xs text-spotify-green hover:underline font-extrabold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Import More</span>
              </button>
            </div>

            {/* Custom Playlists list details */}
            {customPlaylists.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center select-none">
                <div className="w-12 h-12 rounded-full bg-theme-card border border-theme-border flex items-center justify-center text-theme-zinc mb-4.5">
                  <Music className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-theme-text text-sm">No Playlists Found</h4>
                <p className="text-[11px] text-theme-zinc font-semibold mt-1 leading-relaxed max-w-[280px]">
                  Go to the Search page and click "Import Playlist" to bring music from other services.
                </p>
                
                <button 
                  onClick={() => navigate("/search")}
                  className="mt-5 px-6 py-2.5 bg-zinc-950 text-white dark:bg-white dark:text-black font-extrabold text-xs tracking-wider uppercase rounded-full hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
                >
                  Go to Importer
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto no-scrollbar max-h-[500px]">
                {customPlaylists.map((playlist) => {
                  const isCurrentPlaylist = currentSong && playlist.tracks?.some(s => s._id === currentSong._id);
                  const isPlaying = isCurrentPlaylist && playStatus;

                  return (
                    <div 
                      key={playlist._id}
                      onClick={() => navigate(`/album/${playlist._id}`)}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-theme-border bg-theme-card border border-theme-border hover:border-theme-border-hover cursor-pointer transition-all duration-300 group shadow relative overflow-hidden"
                    >
                      {/* Play hover effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-spotify-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Cover art image */}
                      <div className="relative w-12 h-12 rounded overflow-hidden shadow border border-theme-border shrink-0 z-10">
                        <img 
                          src={playlist.image} 
                          alt={playlist.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                        />
                        {/* Hover play button */}
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button 
                            onClick={(e) => handlePlaylistPlay(playlist, e)}
                            className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 active:scale-90 transition-transform cursor-pointer"
                          >
                            {isPlaying ? (
                              <Pause className="w-3.5 h-3.5 fill-current stroke-0" />
                            ) : (
                              <Play className="w-3.5 h-3.5 fill-current ml-0.5 stroke-0" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Playlist Meta details */}
                      <div className="flex-1 overflow-hidden z-10">
                        <h4 className="font-extrabold text-sm text-theme-text group-hover:text-spotify-green truncate transition-colors leading-tight">{playlist.name}</h4>
                        <p className="text-[11px] text-theme-zinc mt-1 truncate leading-relaxed font-medium">{playlist.desc}</p>
                      </div>

                      {/* Actions buttons */}
                      <div className="flex items-center gap-3 shrink-0 z-10 pr-1 select-none">
                        <span className="text-[10px] text-theme-zinc font-bold bg-theme-card border border-theme-border px-2.5 py-1 rounded-full uppercase tabular-nums">
                          {playlist.tracks?.length || 0} songs
                        </span>
                        
                        <button 
                          onClick={(e) => handleDeletePlaylist(playlist._id, playlist.name, e)}
                          className="w-8.5 h-8.5 rounded-full bg-theme-card hover:bg-rose-500/10 border border-theme-border hover:border-rose-500/20 text-theme-zinc hover:text-rose-450 flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer"
                          title="Delete Playlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default UserDashboard;
