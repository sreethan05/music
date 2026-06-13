import { useContext, useState } from "react";
import { PlayerContext } from "../context/PlayerContext";
import { X, Plus, FolderHeart, Check } from "lucide-react";

const PlaylistSelectorModal = () => {
  const { 
    playlistModalOpen, 
    playlistModalSong, 
    closePlaylistModal, 
    customPlaylists, 
    addSongToPlaylist,
    createEmptyPlaylist
  } = useContext(PlayerContext);

  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!playlistModalOpen || !playlistModalSong) return null;

  const handleAddToPlaylist = async (playlistId, playlistName) => {
    const res = await addSongToPlaylist(playlistModalSong, playlistId);
    if (res.success) {
      setSuccessMsg(`Successfully added "${playlistModalSong.name}" to "${playlistName}"!`);
      setErrorMsg("");
      setTimeout(() => {
        setSuccessMsg("");
        closePlaylistModal();
      }, 1500);
    } else {
      setErrorMsg(res.message || "Failed to add song.");
      setSuccessMsg("");
      setTimeout(() => setErrorMsg(""), 3000);
    }
  };

  const handleCreateAndAdd = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    const newPlaylist = createEmptyPlaylist(newPlaylistName.trim());
    setNewPlaylistName("");
    
    if (newPlaylist && newPlaylist._id) {
      const res = await addSongToPlaylist(playlistModalSong, newPlaylist._id);
      if (res.success) {
        setSuccessMsg(`Playlist "${newPlaylist.name}" created & "${playlistModalSong.name}" added!`);
        setErrorMsg("");
        setTimeout(() => {
          setSuccessMsg("");
          closePlaylistModal();
        }, 1500);
      } else {
        setErrorMsg("Playlist created, but failed to add song.");
        setTimeout(() => setErrorMsg(""), 3000);
      }
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[999] p-4 select-none animate-fade-in"
      onClick={closePlaylistModal}
    >
      <div 
        className="w-full max-w-[400px] bg-slate-900/90 dark:bg-zinc-950/95 glass-panel border border-white/10 p-6 rounded-3xl flex flex-col max-h-[80vh] shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={closePlaylistModal}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 hover:bg-white/5 rounded-full cursor-pointer transition-all duration-200"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Header */}
        <div className="mb-5 pr-8">
          <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
            <FolderHeart className="w-5 h-5 text-amber-500" />
            <span>Add to Playlist</span>
          </h2>
          <p className="text-[10px] text-zinc-400 font-bold mt-1 uppercase tracking-wide">
            Select a custom playlist for this song
          </p>
        </div>

        {/* Active Song Summary Card */}
        <div className="flex items-center gap-3.5 p-3.5 bg-white/[0.03] border border-white/5 rounded-2xl mb-5">
          <img 
            src={playlistModalSong.image} 
            alt={playlistModalSong.name} 
            className="w-11 h-11 rounded-lg object-cover shadow border border-white/5"
          />
          <div className="overflow-hidden flex-1">
            <h4 className="text-xs font-extrabold text-white truncate">{playlistModalSong.name}</h4>
            <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-medium">
              {playlistModalSong.desc || playlistModalSong.artist || "Unknown Artist"}
            </p>
          </div>
        </div>

        {/* Success/Error Message display */}
        {successMsg && (
          <div className="mb-4 px-4 py-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 text-[11px] font-extrabold flex items-center gap-2 animate-pulse">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="mb-4 px-4 py-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-400 text-[11px] font-extrabold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Playlists List */}
        <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-2 mb-5 pr-0.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 mb-1">Your Playlists</span>
          
          {customPlaylists.length === 0 ? (
            <div className="text-center py-6 text-xs text-zinc-500 font-bold bg-white/[0.01] rounded-2xl border border-white/5">
              No custom playlists yet.
            </div>
          ) : (
            customPlaylists.map((playlist) => (
              <div 
                key={playlist._id}
                onClick={() => handleAddToPlaylist(playlist._id, playlist.name)}
                className="flex items-center gap-3 p-2 hover:bg-white/[0.05] bg-white/[0.01] border border-white/0 hover:border-white/5 rounded-xl cursor-pointer transition-all duration-200 group"
              >
                <img 
                  src={playlist.image} 
                  alt={playlist.name} 
                  className="w-9 h-9 rounded object-cover shadow border border-white/5 shrink-0"
                />
                <div className="flex-1 overflow-hidden">
                  <h4 className="text-xs font-bold text-white group-hover:text-amber-500 truncate transition-colors">{playlist.name}</h4>
                  <p className="text-[10px] text-zinc-400 truncate mt-0.5 font-medium">{playlist.tracks?.length || 0} tracks</p>
                </div>
                <div className="w-5 h-5 rounded-full border border-white/10 flex items-center justify-center text-transparent group-hover:border-amber-500 group-hover:text-amber-500 hover:scale-105 active:scale-95 transition-all">
                  <Plus className="w-3.5 h-3.5" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Create New Playlist Form */}
        <form onSubmit={handleCreateAndAdd} className="border-t border-white/5 pt-4 flex flex-col gap-2">
          <label className="text-[9px] font-black uppercase tracking-wider text-zinc-500">Create New Playlist</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Playlist name..."
              value={newPlaylistName}
              onChange={(e) => setNewPlaylistName(e.target.value)}
              className="flex-1 bg-white/[0.02] border border-white/5 focus:border-amber-500/50 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-all duration-300"
            />
            <button 
              type="submit"
              disabled={!newPlaylistName.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 text-xs font-extrabold rounded-xl hover:scale-103 active:scale-97 disabled:scale-100 disabled:pointer-events-none transition-all cursor-pointer flex items-center gap-1 shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Create</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default PlaylistSelectorModal;
