import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ListMusic, LogOut, Play, Plus, Trash2, User } from "lucide-react";
import { PlayerContext } from "../context/PlayerContext";

const UserDashboard = () => {
  const navigate = useNavigate();
  const {
    user,
    logoutUser,
    albumsData,
    likedSongs,
    songsData,
    playWithId,
    createEmptyPlaylist,
    deletePlaylist
  } = useContext(PlayerContext);

  if (!user) {
    return (
      <div className="h-full flex items-center justify-center">
        <button
          onClick={() => navigate("/auth")}
          className="px-6 py-3 rounded-2xl bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-black uppercase tracking-widest shadow-md"
        >
          Sign In
        </button>
      </div>
    );
  }

  const customPlaylists = albumsData.filter((album) => album._id?.startsWith("custom_playlist_"));
  const likedTracks = songsData.filter((song) => likedSongs.includes(song._id));

  const handleCreatePlaylist = () => {
    const name = prompt("Playlist name");
    if (!name?.trim()) return;
    const playlist = createEmptyPlaylist(name.trim());
    navigate(`/album/${playlist._id}`);
  };

  const handleLogout = () => {
    logoutUser();
    navigate("/auth");
  };

  return (
    <div className="flex-1 h-full overflow-y-auto pb-28 bg-transparent no-scrollbar select-none">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black text-theme-zinc uppercase tracking-widest pl-1">Profile</p>
            <h1 className="text-3xl font-black text-theme-text tracking-tight mt-1">{user.name}</h1>
            <p className="text-xs text-theme-muted font-bold mt-1">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-full bg-theme-card border border-theme-border text-theme-zinc hover:text-rose-500 hover:border-rose-500/20 text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-theme-card border border-theme-border rounded-2xl p-5 shadow-sm">
            <User className="w-5 h-5 text-amber-500 mb-4" />
            <p className="text-2xl font-black text-theme-text">{user.role === "admin" ? "Admin" : "Listener"}</p>
            <p className="text-[10px] text-theme-zinc font-black uppercase tracking-widest mt-1">Account</p>
          </div>
          <button
            onClick={() => likedTracks[0] && playWithId(likedTracks[0]._id, likedTracks)}
            disabled={likedTracks.length === 0}
            className="bg-theme-card border border-theme-border rounded-2xl p-5 shadow-sm text-left disabled:opacity-60 disabled:cursor-default hover:bg-theme-card-hover hover:border-theme-border-hover transition-all cursor-pointer"
          >
            <Heart className="w-5 h-5 text-rose-500 mb-4" />
            <p className="text-2xl font-black text-theme-text">{likedTracks.length}</p>
            <p className="text-[10px] text-theme-zinc font-black uppercase tracking-widest mt-1">Liked Songs</p>
          </button>
          <button
            onClick={handleCreatePlaylist}
            className="bg-theme-card border border-theme-border rounded-2xl p-5 shadow-sm text-left hover:bg-theme-card-hover hover:border-theme-border-hover transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5 text-emerald-500 mb-4" />
            <p className="text-2xl font-black text-theme-text">{customPlaylists.length}</p>
            <p className="text-[10px] text-theme-zinc font-black uppercase tracking-widest mt-1">Playlists</p>
          </button>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black text-theme-text tracking-tight">Your Playlists</h2>
            <button
              onClick={handleCreatePlaylist}
              className="px-3.5 py-2 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {customPlaylists.length === 0 ? (
            <div className="bg-theme-card border border-theme-border rounded-2xl py-14 px-6 text-center shadow-sm">
              <ListMusic className="w-9 h-9 text-theme-muted mx-auto mb-3" />
              <h3 className="text-sm font-black text-theme-text">No playlists yet</h3>
              <p className="text-xs text-theme-zinc font-semibold mt-1">Create one and add songs from Home or Search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {customPlaylists.map((playlist) => (
                <div
                  key={playlist._id}
                  onClick={() => navigate(`/album/${playlist._id}`)}
                  className="bg-theme-card border border-theme-border rounded-2xl p-3 shadow-sm flex items-center gap-3 hover:bg-theme-card-hover transition-all cursor-pointer group"
                >
                  <img
                    src={playlist.image}
                    alt={playlist.name}
                    className="w-14 h-14 rounded-xl object-cover border border-theme-border"
                  />
                  <div className="flex-1 overflow-hidden">
                    <h3 className="text-sm font-black text-theme-text truncate">{playlist.name}</h3>
                    <p className="text-xs text-theme-zinc font-semibold truncate">{playlist.tracks?.length || 0} songs</p>
                  </div>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      if (confirm(`Delete "${playlist.name}"?`)) deletePlaylist(playlist._id);
                    }}
                    className="w-8 h-8 rounded-full bg-theme-border text-theme-zinc hover:text-rose-500 hover:bg-rose-500/10 flex items-center justify-center transition-all cursor-pointer"
                    title="Delete playlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {playlist.tracks?.length > 0 && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        playWithId(playlist.tracks[0]._id, playlist.tracks);
                      }}
                      className="w-8 h-8 rounded-full bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center transition-all cursor-pointer"
                      title="Play playlist"
                    >
                      <Play className="w-3.5 h-3.5 fill-current stroke-0 ml-0.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
