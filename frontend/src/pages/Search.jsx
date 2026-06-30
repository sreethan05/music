import { useContext, useMemo, useState, useEffect, useRef } from "react";
import axios from "axios";
import { PlayerContext } from "../context/PlayerContext";
import API_URL from "../config/api";
import { Clock, Music, Play, Plus, Search as SearchIcon, SearchX, Volume2, X, Sparkles, Globe } from "lucide-react";

const FALLBACK_COVER = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=70";

const Search = () => {
  const {
    songsData,
    albumsData,
    currentSong,
    playStatus,
    playWithId,
    searchQuery,
    setSearchQuery,
    openPlaylistModal,
    isLibraryLoading,
    libraryError,
    refreshLibrary
  } = useContext(PlayerContext);

  const [visibleCount, setVisibleCount] = useState({ scope: "", count: 50 });
  const [searchMode, setSearchMode] = useState("local"); // local or online
  const [onlineResults, setOnlineResults] = useState([]);
  const [isOnlineLoading, setIsOnlineLoading] = useState(false);
  const [onlineError, setOnlineError] = useState("");
  const inputRef = useRef(null);
  const resultScope = `${searchMode}:${searchQuery.trim().toLowerCase()}`;
  const currentVisibleCount = visibleCount.scope === resultScope ? visibleCount.count : 50;

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Debounced effect for JioSaavn online search
  useEffect(() => {
    if (searchMode !== "online" || !searchQuery.trim()) {
      return;
    }

    let isActive = true;
    const delayDebounceFn = setTimeout(async () => {
      setIsOnlineLoading(true);
      setOnlineError("");

      try {
        const res = await axios.get(`${API_URL}/api/saavn/search`, {
          params: { query: searchQuery.trim() }
        });
        if (!isActive) return;

        if (res.data.success) {
          const mapped = (res.data.data || []).map((song, idx) => ({
            _id: song.id || song._id || `online_song_${Date.now()}_${idx}`,
            ...song
          }));
          setOnlineResults(mapped);
        } else {
          setOnlineError(res.data.message || "No results found online.");
        }
      } catch (err) {
        if (!isActive) return;
        console.error("Online search failed:", err);
        setOnlineError("Could not retrieve online results. Check your internet connection.");
      } finally {
        if (isActive) setIsOnlineLoading(false);
      }
    }, 600); // 600ms debounce

    return () => {
      isActive = false;
      clearTimeout(delayDebounceFn);
    };
  }, [searchQuery, searchMode]);

  // Local matching memo
  const localResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return songsData.slice(0, 24);

    return songsData.filter((song) => {
      const nameMatch = song.name ? song.name.toLowerCase().includes(query) : false;
      const descMatch = song.desc ? song.desc.toLowerCase().includes(query) : false;
      const albumMatch = song.album ? song.album.toLowerCase().includes(query) : false;
      return nameMatch || descMatch || albumMatch;
    });
  }, [songsData, searchQuery]);

  const browseCategories = useMemo(() => {
    const names = new Set(albumsData.map((album) => album.name).filter(Boolean));
    ["Telugu Melodies", "Bollywood Hits", "English Pop", "Romantic", "Focus"].forEach((name) => names.add(name));
    return [...names].slice(0, 8);
  }, [albumsData]);

  const handleImageError = (event) => {
    event.currentTarget.src = FALLBACK_COVER;
  };

  const resultsToRender = searchMode === "online" && searchQuery.trim() ? onlineResults : localResults;
  const isLoading = searchMode === "online" && searchQuery.trim() ? isOnlineLoading : isLibraryLoading;
  const hasError = searchMode === "online" && searchQuery.trim() ? onlineError : libraryError;

  return (
    <div className="flex-1 h-full overflow-y-auto pb-28 bg-transparent no-scrollbar select-none">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <p className="text-[10px] font-black text-theme-zinc uppercase tracking-widest pl-1">Search</p>
          <h1 className="text-3xl font-black text-theme-text tracking-tight">Find your next track</h1>
        </div>

        {/* Input area */}
        <div className="relative max-w-2xl">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-theme-zinc w-4.5 h-4.5" />
          <input
            ref={inputRef}
            type="text"
            placeholder={searchMode === "online" ? "Search any song in the world (JioSaavn)..." : "Search songs, artists, or albums..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-theme-card border border-theme-border text-theme-text placeholder:text-theme-muted text-sm pl-12 pr-12 py-3.5 rounded-2xl focus:outline-none focus:border-theme-border-hover focus:ring-2 focus:ring-theme-border transition-all font-semibold shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-theme-zinc hover:text-theme-text transition-colors cursor-pointer"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-theme-border pb-3">
          <button
            onClick={() => setSearchMode("local")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === "local"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-theme-zinc hover:text-theme-text hover:bg-theme-card"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>My Library</span>
          </button>
          <button
            onClick={() => setSearchMode("online")}
            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
              searchMode === "online"
                ? "bg-slate-900 dark:bg-white text-white dark:text-black shadow-sm"
                : "text-theme-zinc hover:text-theme-text hover:bg-theme-card"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Search Online</span>
          </button>
        </div>

        {/* Browse Section (Only local & when query is empty) */}
        {searchMode === "local" && !searchQuery.trim() && (
          <div>
            <h2 className="text-sm font-black text-theme-text tracking-tight mb-3">Browse</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {browseCategories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSearchQuery(category)}
                  className="min-h-24 rounded-2xl bg-theme-card border border-theme-border p-4 text-left hover:bg-theme-card-hover hover:border-theme-border-hover transition-all cursor-pointer shadow-sm"
                >
                  <Music className="w-5 h-5 text-amber-500 mb-4" />
                  <span className="text-sm font-black text-theme-text leading-tight">{category}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Online Initial Prompt Screen */}
        {searchMode === "online" && !searchQuery.trim() && (
          <div className="w-full py-16 bg-theme-card border border-theme-border rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-theme-text">Global Search Mode</h3>
            <p className="text-xs text-theme-zinc mt-1 font-semibold max-w-sm">
              Type anything in the search bar above to stream and play any track in the world dynamically from JioSaavn.
            </p>
          </div>
        )}

        {/* Results rendering */}
        {(searchQuery.trim() || searchMode === "local") && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-black text-theme-text tracking-tight">
                {searchQuery.trim() ? "Results" : "Recommended"}
              </h2>
              {!isLoading && !hasError && (
                <span className="text-[10px] font-black uppercase tracking-widest text-theme-zinc">
                  {resultsToRender.length.toLocaleString()} tracks
                </span>
              )}
            </div>

            {isLoading && (searchMode === "online" || songsData.length === 0) ? (
              <div className="flex flex-col gap-2">
                <div className="hidden md:grid grid-cols-12 px-4 py-2 border-b border-theme-border">
                  <div className="col-span-6 h-3 w-16 bg-theme-border rounded animate-pulse" />
                  <div className="col-span-3 h-3 w-16 bg-theme-border rounded animate-pulse" />
                  <div className="col-span-2 h-3 w-12 bg-theme-border rounded animate-pulse mx-auto" />
                  <div className="col-span-1" />
                </div>
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-3 items-center px-4 py-3 bg-theme-card/30 border border-theme-border/40 rounded-2xl animate-pulse">
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-theme-border shrink-0 animate-pulse" />
                      <div className="flex flex-col gap-2 w-full max-w-[150px]">
                        <div className="h-3.5 bg-theme-border rounded w-3/4 animate-pulse" />
                        <div className="h-2.5 bg-theme-border rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                    <div className="hidden md:block col-span-3 h-3 bg-theme-border rounded w-1/2 animate-pulse" />
                    <div className="col-span-2 h-3 bg-theme-border rounded w-8 mx-auto animate-pulse" />
                    <div className="col-span-1 flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-theme-border animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            ) : hasError && (searchMode === "online" || songsData.length === 0) ? (
              <div className="w-full py-16 px-6 bg-theme-card border border-theme-border rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mb-4">
                  <SearchX className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-black text-theme-text">
                  {searchMode === "online" ? "Search Failed" : "Database Connection Failed"}
                </h3>
                <p className="text-xs text-theme-zinc mt-2 font-semibold max-w-sm leading-relaxed">
                  {hasError}
                </p>
                {searchMode === "local" && (
                  <button
                    onClick={refreshLibrary}
                    className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-zinc-100 hover:bg-slate-950 dark:hover:bg-white text-white dark:text-zinc-950 font-extrabold text-[10.5px] tracking-wider uppercase rounded-full hover:scale-105 active:scale-95 transition-all shadow cursor-pointer"
                  >
                    Retry Connection
                  </button>
                )}
              </div>
            ) : resultsToRender.length === 0 ? (
              <div className="w-full py-16 bg-theme-card border border-theme-border rounded-2xl shadow-sm flex flex-col items-center justify-center text-center">
                <SearchX className="w-9 h-9 text-theme-muted mb-3" />
                <h3 className="text-sm font-black text-theme-text">No matching tracks</h3>
                <p className="text-xs text-theme-zinc mt-1 font-semibold">Try another song, artist, or album name.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-1.5">
                <div className="hidden md:grid grid-cols-12 px-4 py-2 text-[10px] font-black tracking-widest text-theme-zinc uppercase border-b border-theme-border">
                  <span className="col-span-6">Title</span>
                  <span className="col-span-3">Album</span>
                  <span className="col-span-2 text-center flex justify-center">
                    <Clock className="w-3.5 h-3.5" />
                  </span>
                  <span className="col-span-1" />
                </div>

                {resultsToRender.slice(0, currentVisibleCount).map((song) => {
                  const isActive = currentSong?._id === song._id;
                  return (
                    <div
                      key={song._id}
                      onClick={() => playWithId(song._id, resultsToRender)}
                      className={`grid grid-cols-12 gap-3 items-center px-3 md:px-4 py-3 rounded-2xl transition-all cursor-pointer group ${
                        isActive ? "bg-theme-card border border-theme-border shadow-sm" : "hover:bg-theme-card/60"
                      }`}
                    >
                      <div className="col-span-9 md:col-span-6 flex items-center gap-3 overflow-hidden">
                        <div className="relative shrink-0">
                          <img
                            src={song.image}
                            alt={song.name}
                            onError={handleImageError}
                            className="w-11 h-11 rounded-xl object-cover border border-theme-border shadow-sm"
                          />
                          <div className="absolute inset-0 rounded-xl bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {isActive && playStatus ? (
                              <Volume2 className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white fill-current stroke-0 ml-0.5" />
                            )}
                          </div>
                        </div>
                        <div className="overflow-hidden">
                          <h3 className={`text-sm truncate ${isActive ? "font-black text-theme-text" : "font-extrabold text-theme-zinc"}`}>
                            {song.name}
                          </h3>
                          <p className="text-xs text-theme-muted font-semibold truncate">{song.desc || "Unknown artist"}</p>
                        </div>
                      </div>

                      <span className="hidden md:block md:col-span-3 text-xs text-theme-zinc font-bold truncate">
                        {song.album || "Single"}
                      </span>
                      <span className="col-span-2 text-center text-xs text-theme-zinc font-bold tabular-nums">
                        {song.duration || "3:00"}
                      </span>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openPlaylistModal(song);
                          }}
                          className="w-8 h-8 rounded-full bg-theme-border hover:bg-theme-border-hover flex items-center justify-center text-theme-zinc hover:text-theme-text transition-all cursor-pointer"
                          title="Add to playlist"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {resultsToRender.length > currentVisibleCount && !isLoading && !hasError && (
              <button
                onClick={() => setVisibleCount({ scope: resultScope, count: currentVisibleCount + 50 })}
                className="mt-4 w-full py-3.5 bg-theme-card border border-theme-border hover:bg-theme-border text-theme-text rounded-2xl text-xs font-black uppercase tracking-widest transition-all active:scale-[0.99] cursor-pointer"
              >
                Load More Results
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
