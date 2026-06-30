import { useContext, useState } from "react";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import API_URL from "../config/api";
import { 
  X, 
  Music, 
  Video, 
  ClipboardList,
  FileMusic, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  PlusCircle,
  Play
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ImportPlaylistModal = () => {
  const { 
    importModalOpen, 
    closeImportModal, 
    token, 
    createPlaylist 
  } = useContext(PlayerContext);
  
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("spotify"); // spotify, youtube, saavn, text
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [textList, setTextList] = useState("");
  const [customName, setCustomName] = useState("");
  
  // Status states
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [importedPlaylistId, setImportedPlaylistId] = useState(null);

  if (!importModalOpen) return null;

  const handleImport = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    const urlPayload = activeTab !== "text" ? playlistUrl.trim() : "";
    const textPayload = activeTab === "text" ? textList.trim() : "";

    if (activeTab !== "text" && !urlPayload) {
      setError("Please paste a valid playlist link.");
      return;
    }
    if (activeTab === "text" && !textPayload) {
      setError("Please paste a tracklist text list.");
      return;
    }

    setLoading(true);
    setStatusMessage("Step 1: Fetching playlist tracks...");

    try {
      // Step 1: Query backend parser & resolver
      const res = await axios.post(
        `${API_URL}/api/import/playlist`,
        {
          url: urlPayload,
          textList: textPayload,
          name: customName.trim() || undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (res.data.success && res.data.tracks && res.data.tracks.length > 0) {
        setStatusMessage(`Step 2: Creating local playlist with ${res.data.tracks.length} tracks...`);
        
        // Save the playlist to localStorage/context
        const createRes = await createPlaylist(res.data.playlistName, res.data.tracks);
        
        if (createRes.success && createRes.playlist) {
          setSuccess(true);
          setImportedPlaylistId(createRes.playlist._id);
          setStatusMessage(`Successfully imported "${res.data.playlistName}"!`);
          
          // Clear inputs
          setPlaylistUrl("");
          setTextList("");
          setCustomName("");
        } else {
          setError(createRes.message || "Failed to create local playlist.");
        }
      } else {
        setError(res.data.message || "No matching tracks could be resolved on JioSaavn.");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Import failed. Please check your internet connection and verify the playlist is public.");
    } finally {
      setLoading(false);
    }
  };

  const navigateToPlaylist = () => {
    if (importedPlaylistId) {
      navigate(`/album/${importedPlaylistId}`);
      closeImportModal();
      setSuccess(false);
      setImportedPlaylistId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-md p-4 animate-fade-in">
      <div 
        className="w-full max-w-[550px] bg-white dark:bg-zinc-900 border border-slate-200/50 dark:border-white/5 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-white/5">
          <div>
            <h3 className="text-lg font-black text-slate-800 dark:text-white tracking-tight">Import Playlist</h3>
            <p className="text-[10px] text-slate-400 font-bold mt-1">Convert your playlists from other apps natively</p>
          </div>
          <button 
            onClick={closeImportModal}
            className="w-8 h-8 rounded-full bg-slate-50 dark:bg-zinc-800 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-4 border-b border-slate-100 dark:border-white/5 p-2 bg-slate-50/50 dark:bg-zinc-950/20">
          <button
            onClick={() => { setActiveTab("spotify"); setError(""); }}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "spotify"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
            }`}
          >
            <Music className="w-4.5 h-4.5" />
            <span>Spotify</span>
          </button>
          
          <button
            onClick={() => { setActiveTab("youtube"); setError(""); }}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "youtube"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
            }`}
          >
            <Video className="w-4.5 h-4.5" />
            <span>YouTube</span>
          </button>

          <button
            onClick={() => { setActiveTab("saavn"); setError(""); }}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "saavn"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
            }`}
          >
            <FileMusic className="w-4.5 h-4.5" />
            <span>JioSaavn</span>
          </button>

          <button
            onClick={() => { setActiveTab("text"); setError(""); }}
            className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeTab === "text"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-slate-400 dark:text-zinc-500 hover:text-slate-800 dark:hover:text-zinc-300"
            }`}
          >
            <ClipboardList className="w-4.5 h-4.5" />
            <span>Universal</span>
          </button>
        </div>

        {/* Form Area */}
        <form onSubmit={handleImport} className="flex-1 overflow-y-auto p-8 flex flex-col gap-5 no-scrollbar">
          {error && (
            <div className="rounded-2xl border border-red-200 bg-rose-50 dark:bg-rose-950/20 dark:border-rose-900 px-4 py-3 text-red-700 dark:text-rose-400 flex items-center gap-3 shadow-sm select-none">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}

          {success ? (
            <div className="rounded-2xl border border-green-200 bg-emerald-50 dark:bg-emerald-950/20 dark:border-emerald-900 px-6 py-6 text-green-700 dark:text-emerald-400 flex flex-col items-center text-center gap-4 shadow-sm select-none animate-scale-up">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 animate-bounce" />
              <div>
                <h4 className="text-sm font-black tracking-tight text-slate-800 dark:text-white">Import Complete!</h4>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold mt-1.5">{statusMessage}</p>
              </div>
              <button
                type="button"
                onClick={navigateToPlaylist}
                className="w-full mt-2 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow flex items-center justify-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current stroke-0" />
                <span>Go to Playlist</span>
              </button>
            </div>
          ) : (
            <>
              {/* Optional Custom Playlist Name */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                  Playlist Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Leave blank to use original title"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  disabled={loading}
                  className="w-full px-5 py-3.5 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-white/5 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* URL Import Mode */}
              {activeTab !== "text" ? (
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    {activeTab === "spotify" ? "Spotify Playlist Link" : activeTab === "youtube" ? "YouTube / YT Music Link" : "JioSaavn Playlist Link"}
                  </label>
                  <input
                    type="url"
                    placeholder={
                      activeTab === "spotify" 
                        ? "https://open.spotify.com/playlist/..." 
                        : activeTab === "youtube"
                        ? "https://music.youtube.com/playlist?list=..."
                        : "https://www.jiosaavn.com/featured/..."
                    }
                    value={playlistUrl}
                    onChange={(e) => setPlaylistUrl(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-white/5 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                  <p className="text-[9px] text-slate-400 font-bold leading-normal pl-1 mt-0.5">
                    Make sure the playlist is set to <strong>Public</strong> so it can be parsed.
                  </p>
                </div>
              ) : (
                /* Plain Text Custom Import Mode */
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider pl-1">
                    Universal Text List (Apple Music, Tidal, Deezer, etc.)
                  </label>
                  <textarea
                    rows="6"
                    placeholder="Paste your tracklist here. Examples:&#10;1. Olivia Rodrigo - stupid song&#10;Blinding Lights by The Weeknd&#10;Flowers - Miley Cyrus"
                    value={textList}
                    onChange={(e) => setTextList(e.target.value)}
                    disabled={loading}
                    required
                    className="w-full px-5 py-4 rounded-2xl text-xs font-bold bg-slate-50 dark:bg-zinc-950 border border-slate-200/60 dark:border-white/5 focus:outline-none focus:border-amber-500 transition-colors resize-none leading-relaxed"
                  />
                  <p className="text-[9px] text-slate-400 font-bold leading-normal pl-1 mt-0.5">
                    Copy the track names from your source application (e.g. Apple Music, Tidal) and paste them here. Tracks will be automatically resolved.
                  </p>
                </div>
              )}

              {/* Status and Action Trigger */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-4 gap-3 select-none">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                  <p className="text-xs text-amber-500 font-extrabold">{statusMessage}</p>
                </div>
              ) : (
                <button
                  type="submit"
                  className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-950 dark:bg-white dark:hover:bg-slate-50 text-white dark:text-black font-extrabold text-xs tracking-wider uppercase rounded-xl hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Import Playlist</span>
                </button>
              )}
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ImportPlaylistModal;
