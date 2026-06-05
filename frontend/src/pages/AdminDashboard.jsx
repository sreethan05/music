import { useState, useContext } from "react";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import API_URL from "../config/api";
import { 
  Music, 
  ListMusic, 
  FolderHeart, 
  FolderOpen, 
  UploadCloud, 
  Trash2, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Database,
  Disc
} from "lucide-react";

const AdminDashboard = () => {
  const { songsData, albumsData, refreshLibrary, token } = useContext(PlayerContext);
  const [activeTab, setActiveTab] = useState("add-song");

  // Loading states
  const [loading, setLoading] = useState(false);
  
  // Notification states
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Form states - Song
  const [songName, setSongName] = useState("");
  const [songDesc, setSongDesc] = useState("");
  const [songAlbum, setSongAlbum] = useState("");
  const [songAudioFile, setSongAudioFile] = useState(null);
  const [songImageFile, setSongImageFile] = useState(null);

  // Form states - Album
  const [albumName, setAlbumName] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [albumColor, setAlbumColor] = useState("#10766e");
  const [albumImageFile, setAlbumImageFile] = useState(null);

  const triggerNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 4000);
  };

  // Submissions
  const handleAddSong = async (e) => {
    e.preventDefault();
    if (!songAudioFile || !songImageFile || !songName || !songDesc || !songAlbum) {
      triggerNotification("Please fill in all fields and select files.", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", songName);
    formData.append("desc", songDesc);
    formData.append("album", songAlbum);
    formData.append("audio", songAudioFile);
    formData.append("image", songImageFile);

    try {
      const res = await axios.post(`${API_URL}/api/song/add`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.data.success) {
        triggerNotification("Song added successfully!");
        setSongName("");
        setSongDesc("");
        setSongAlbum("");
        setSongAudioFile(null);
        setSongImageFile(null);
        refreshLibrary();
      }
    } catch (error) {
      console.error(error);
      triggerNotification(error.response?.data?.message || "Failed to add song.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAlbum = async (e) => {
    e.preventDefault();
    if (!albumName || !albumDesc || !albumImageFile) {
      triggerNotification("Please fill in all fields and select a cover image.", "error");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", albumName);
    formData.append("desc", albumDesc);
    formData.append("bgColour", albumColor);
    formData.append("image", albumImageFile);

    try {
      const res = await axios.post(`${API_URL}/api/album/add`, formData, {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.data.success) {
        triggerNotification("Album added successfully!");
        setAlbumName("");
        setAlbumDesc("");
        setAlbumColor("#10766e");
        setAlbumImageFile(null);
        refreshLibrary();
      }
    } catch (error) {
      console.error(error);
      triggerNotification(error.response?.data?.message || "Failed to add album.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSong = async (id) => {
    if (!window.confirm("Are you sure you want to delete this song?")) return;
    try {
      const res = await axios.post(`${API_URL}/api/song/remove`, { id }, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.data.success) {
        triggerNotification("Song removed successfully!");
        refreshLibrary();
      }
    } catch (error) {
      console.error(error);
      triggerNotification("Failed to remove song.", "error");
    }
  };

  const handleRemoveAlbum = async (id) => {
    if (!window.confirm("Are you sure you want to delete this album? This will not delete the songs inside it, but they will be unlinked.")) return;
    try {
      const res = await axios.post(`${API_URL}/api/album/remove`, { id }, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.data.success) {
        triggerNotification("Album removed successfully!");
        refreshLibrary();
      }
    } catch (error) {
      console.error(error);
      triggerNotification("Failed to remove album.", "error");
    }
  };

  return (
    <div className="flex-1 h-full overflow-y-auto pb-28 bg-theme-bg flex flex-col no-scrollbar relative select-none overflow-hidden transition-colors duration-300">
      
      {/* Ambient background glows */}
      <div className="ambient-glow top-0 right-1/4 opacity-40" />
      <div className="ambient-glow-purple bottom-10 left-10 opacity-30" />

      {/* Toast Notification */}
      {notification.show && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3.5 px-5 py-3.5 rounded-xl shadow-2xl text-white border backdrop-blur-md transition-all duration-300 transform translate-y-0 ${
          notification.type === "success" 
            ? "bg-emerald-950/90 border-emerald-500/30 shadow-emerald-500/5" 
            : "bg-red-950/90 border-red-500/30 shadow-red-500/5"
        }`}>
          {notification.type === "success" ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400" />
          )}
          <span className="text-sm font-bold tracking-wide">{notification.message}</span>
        </div>
      )}

      <div className="flex-1 flex flex-col p-6 gap-6 relative z-10">
        
        {/* Statistics Section */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex items-center gap-4.5 shadow-lg group hover:border-white/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-spotify-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-spotify-green/10 border border-spotify-green/20 flex items-center justify-center text-spotify-green shadow-inner">
              <Disc className="w-6 h-6 animate-[spin_5s_linear_infinite]" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Total Songs</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{songsData.length}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex items-center gap-4.5 shadow-lg group hover:border-white/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <FolderOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Total Albums</p>
              <h3 className="text-2xl font-extrabold text-white mt-0.5 tracking-tight">{albumsData.length}</h3>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-white/5 relative overflow-hidden flex items-center gap-4.5 shadow-lg group hover:border-white/10 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 shadow-inner">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">System Database</p>
              <h3 className="text-sm font-extrabold text-emerald-400 mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Connected
              </h3>
            </div>
          </div>
        </div>

        {/* Dashboard Workspace */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-[500px]">
          
          {/* Admin Navigation Sidebar */}
          <div className="w-full md:w-64 glass-panel rounded-2xl p-4 flex flex-col gap-2 shadow-xl border border-white/5 h-fit">
            <h2 className="text-[10px] uppercase tracking-widest text-zinc-500 font-extrabold px-3.5 py-2.5">Dashboard Controls</h2>
            <button 
              onClick={() => setActiveTab("add-song")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === "add-song" 
                  ? "bg-spotify-green text-black shadow-lg shadow-spotify-green/20 hover:scale-101 active:scale-99" 
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Add Song</span>
            </button>
            <button 
              onClick={() => setActiveTab("list-songs")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === "list-songs" 
                  ? "bg-spotify-green text-black shadow-lg shadow-spotify-green/20 hover:scale-101 active:scale-99" 
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <ListMusic className="w-4 h-4" />
              <span>List Songs</span>
            </button>
            <button 
              onClick={() => setActiveTab("add-album")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === "add-album" 
                  ? "bg-spotify-green text-black shadow-lg shadow-spotify-green/20 hover:scale-101 active:scale-99" 
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <FolderHeart className="w-4 h-4" />
              <span>Add Album</span>
            </button>
            <button 
              onClick={() => setActiveTab("list-albums")}
              className={`flex items-center gap-3 w-full px-4 py-3.5 rounded-xl text-xs font-bold tracking-wide transition-all duration-300 cursor-pointer ${
                activeTab === "list-albums" 
                  ? "bg-spotify-green text-black shadow-lg shadow-spotify-green/20 hover:scale-101 active:scale-99" 
                  : "text-zinc-400 hover:bg-white/[0.03] hover:text-white"
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              <span>List Albums</span>
            </button>
          </div>

          {/* Dashboard Panels */}
          <div className="flex-1 glass-panel rounded-2xl p-6 md:p-8 shadow-xl border border-white/5 relative overflow-hidden">
            
            {/* Global Loader Layer */}
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-md z-40 flex items-center justify-center flex-col gap-3.5">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-spotify-green/10 border-t-spotify-green animate-spin" />
                  <Loader2 className="w-6 h-6 text-spotify-green animate-spin absolute" />
                </div>
                <span className="text-white text-xs font-bold tracking-widest uppercase">Processing Upload...</span>
              </div>
            )}

            {/* ADD SONG TAB */}
            {activeTab === "add-song" && (
              <form onSubmit={handleAddSong} className="flex flex-col gap-6 text-zinc-300">
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">Add a New Song</h1>
                  <p className="text-xs text-zinc-500 mt-1">Upload audio and artwork files to make a song available.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-5">
                  {/* Audio Upload */}
                  <div className="flex-1">
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Song Audio File (.mp3)</label>
                    <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-5 hover:border-spotify-green/50 hover:bg-white/[0.01] cursor-pointer transition-all duration-300">
                      <UploadCloud className="w-7 h-7 text-zinc-500 mb-2 group-hover:text-spotify-green" />
                      <span className="text-xs text-center font-semibold text-zinc-400 truncate max-w-[200px]">
                        {songAudioFile ? songAudioFile.name : "Select MP3 Audio File"}
                      </span>
                      <input 
                        type="file" 
                        accept="audio/mp3" 
                        onChange={(e) => setSongAudioFile(e.target.files[0])} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Cover Image Upload */}
                  <div className="flex-1">
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Song Cover Image</label>
                    <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-5 hover:border-spotify-green/50 hover:bg-white/[0.01] cursor-pointer transition-all duration-300">
                      {songImageFile ? (
                        <img 
                          src={URL.createObjectURL(songImageFile)} 
                          alt="Preview" 
                          className="w-10 h-10 rounded object-cover shadow border border-white/10" 
                        />
                      ) : (
                        <>
                          <UploadCloud className="w-7 h-7 text-zinc-500 mb-2" />
                          <span className="text-xs text-center font-semibold text-zinc-400">Select Cover Art Image</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setSongImageFile(e.target.files[0])} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Song Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Neon Nights" 
                      value={songName} 
                      onChange={(e) => setSongName(e.target.value)} 
                      className="w-full glass-input p-3 rounded-xl text-xs text-white focus:outline-none focus:border-spotify-green transition-all" 
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Select Album</label>
                    <select 
                      value={songAlbum} 
                      onChange={(e) => setSongAlbum(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-xs text-zinc-400 focus:outline-none focus:border-spotify-green transition-all cursor-pointer [&>option]:bg-zinc-950 [&>option]:text-white"
                    >
                      <option value="">-- Choose Album --</option>
                      <option value="None">None (Single)</option>
                      {albumsData.map((item) => (
                        <option key={item._id} value={item.name}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Song Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="Tell listeners what this song is about..." 
                    value={songDesc} 
                    onChange={(e) => setSongDesc(e.target.value)} 
                    className="w-full glass-input p-3 rounded-xl text-xs text-white focus:outline-none focus:border-spotify-green transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-fit self-start px-7 py-3 bg-spotify-green text-black font-extrabold text-xs rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-lg shadow-spotify-green/10"
                >
                  Add Song
                </button>
              </form>
            )}

            {/* ADD ALBUM TAB */}
            {activeTab === "add-album" && (
              <form onSubmit={handleAddAlbum} className="flex flex-col gap-6 text-zinc-300">
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">Create a New Album</h1>
                  <p className="text-xs text-zinc-500 mt-1">Group songs together with a customized background theme color.</p>
                </div>

                <div className="flex flex-col md:flex-row gap-5">
                  {/* Image Upload */}
                  <div className="flex-1">
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Album Cover Image</label>
                    <label className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-5 hover:border-spotify-green/50 hover:bg-white/[0.01] cursor-pointer transition-all duration-300 h-[110px]">
                      {albumImageFile ? (
                        <img 
                          src={URL.createObjectURL(albumImageFile)} 
                          alt="Preview" 
                          className="w-12 h-12 rounded object-cover shadow border border-white/10" 
                        />
                      ) : (
                        <>
                          <UploadCloud className="w-7 h-7 text-zinc-500 mb-2" />
                          <span className="text-xs text-center font-semibold text-zinc-400">Select Album Artwork Image</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => setAlbumImageFile(e.target.files[0])} 
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* Color Picker */}
                  <div className="flex-1 flex flex-col justify-center">
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Album Theme Color</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={albumColor} 
                        onChange={(e) => setAlbumColor(e.target.value)} 
                        className="w-9 h-9 border-0 bg-transparent rounded-lg cursor-pointer" 
                      />
                      <span className="text-xs font-mono tracking-wider font-extrabold uppercase text-white">{albumColor}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-2.5 leading-relaxed block">
                      Used to create a beautiful gradient background on the album page.
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Album Title</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Chill Vibes" 
                      value={albumName} 
                      onChange={(e) => setAlbumName(e.target.value)} 
                      className="w-full glass-input p-3 rounded-xl text-xs text-white focus:outline-none focus:border-spotify-green transition-all" 
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold tracking-wide block mb-2 text-zinc-400 uppercase">Album Description</label>
                  <textarea 
                    rows="3" 
                    placeholder="e.g. Chill instrumentals and acoustic melodies to relax..." 
                    value={albumDesc} 
                    onChange={(e) => setAlbumDesc(e.target.value)} 
                    className="w-full glass-input p-3 rounded-xl text-xs text-white focus:outline-none focus:border-spotify-green transition-all resize-none"
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-fit self-start px-7 py-3 bg-spotify-green text-black font-extrabold text-xs rounded-full hover:scale-105 active:scale-95 transition-transform duration-200 cursor-pointer shadow-lg shadow-spotify-green/10"
                >
                  Add Album
                </button>
              </form>
            )}

            {/* LIST SONGS TAB */}
            {activeTab === "list-songs" && (
              <div className="flex flex-col gap-4 text-zinc-300">
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">All Uploaded Songs</h1>
                  <p className="text-xs text-zinc-500 mt-1">Manage and delete tracks from the library.</p>
                </div>

                <div className="overflow-x-auto mt-2 max-h-[480px] no-scrollbar">
                  {songsData.length === 0 ? (
                    <div className="text-center text-zinc-500 py-16 text-sm">
                      No songs found. Go add one!
                    </div>
                  ) : (
                    <table className="w-full text-left text-zinc-400 border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                          <th className="py-3 pl-2">Track</th>
                          <th className="py-3 hidden md:table-cell">Album</th>
                          <th className="py-3 hidden sm:table-cell">Description</th>
                          <th className="py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="before:block before:h-2">
                        {songsData.slice(0, 100).map((item) => (
                          <tr key={item._id} className="hover:bg-white/[0.03] rounded-lg transition-all duration-200">
                            <td className="py-3 flex items-center gap-3.5 pl-2 rounded-l-lg">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover shadow border border-white/5" />
                              <span className="text-sm font-semibold text-white">{item.name}</span>
                            </td>
                            <td className="py-3 text-sm hidden md:table-cell font-medium">{item.album}</td>
                            <td className="py-3 text-xs hidden sm:table-cell truncate max-w-xs text-zinc-400 font-medium">{item.desc}</td>
                            <td className="py-3 text-center rounded-r-lg">
                              <button 
                                onClick={() => handleRemoveSong(item._id)}
                                className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer"
                                title="Delete Song"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* LIST ALBUMS TAB */}
            {activeTab === "list-albums" && (
              <div className="flex flex-col gap-4 text-zinc-300">
                <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">All Created Albums</h1>
                  <p className="text-xs text-zinc-500 mt-1">Manage and delete playlists from the homepage catalog.</p>
                </div>

                <div className="overflow-x-auto mt-2 max-h-[480px] no-scrollbar">
                  {albumsData.length === 0 ? (
                    <div className="text-center text-zinc-500 py-16 text-sm">
                      No albums found. Go create one!
                    </div>
                  ) : (
                    <table className="w-full text-left text-zinc-400 border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[10px] font-extrabold uppercase tracking-widest text-zinc-500">
                          <th className="py-3 pl-2">Album</th>
                          <th className="py-3 hidden sm:table-cell">Theme</th>
                          <th className="py-3 hidden md:table-cell">Description</th>
                          <th className="py-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="before:block before:h-2">
                        {albumsData.map((item) => (
                          <tr key={item._id} className="hover:bg-white/[0.03] rounded-lg transition-all duration-200">
                            <td className="py-3 flex items-center gap-3.5 pl-2 rounded-l-lg">
                              <img src={item.image} alt={item.name} className="w-10 h-10 rounded object-cover shadow border border-white/5" />
                              <span className="text-sm font-semibold text-white">{item.name}</span>
                            </td>
                            <td className="py-3 text-xs hidden sm:table-cell rounded-none">
                              <div className="flex items-center gap-2">
                                <span 
                                  className="w-4.5 h-4.5 rounded-full border border-white/10 shadow-sm" 
                                  style={{ backgroundColor: item.bgColour }} 
                                />
                                <span className="font-mono text-zinc-400 uppercase font-bold">{item.bgColour}</span>
                              </div>
                            </td>
                            <td className="py-3 text-xs hidden md:table-cell truncate max-w-xs text-zinc-400 font-medium">{item.desc}</td>
                            <td className="py-3 text-center rounded-r-lg">
                              <button 
                                onClick={() => handleRemoveAlbum(item._id)}
                                className="p-2.5 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-200 cursor-pointer"
                                title="Delete Album"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
