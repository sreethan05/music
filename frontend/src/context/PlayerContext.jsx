/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import API_URL from "../config/api";

export const PlayerContext = createContext();

const FALLBACK_COVER = "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=70";

const extractDominantColor = (imageUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imageUrl;
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = 1;
        canvas.height = 1;
        ctx.drawImage(img, 0, 0, 1, 1);
        const imgData = ctx.getImageData(0, 0, 1, 1).data;
        const [r, g, b] = imgData;
        
        let adjustedR = r;
        let adjustedG = g;
        let adjustedB = b;
        
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        if (brightness < 40) {
          adjustedR = Math.min(255, r + 60);
          adjustedG = Math.min(255, g + 60);
          adjustedB = Math.min(255, b + 60);
        } else if (brightness > 220) {
          adjustedR = Math.max(0, r - 60);
          adjustedG = Math.max(0, g - 60);
          adjustedB = Math.max(0, b - 60);
        }

        resolve(`${adjustedR}, ${adjustedG}, ${adjustedB}`);
      } catch {
        resolve("0, 136, 255"); // Fallback to Electric Blue
      }
    };
    img.onerror = () => {
      resolve("0, 136, 255"); // Fallback
    };
  });
};

const PlayerContextProvider = (props) => {
  const audioRef = useRef(new Audio());
  const seekBarRef = useRef(null);

  // Web Audio EQ, Sleep Timer and Fade refs/states
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
  const filtersRef = useRef([]);
  const analyserRef = useRef(null);
  const [eqPreset, setEqPreset] = useState("flat");
  const [eqGains, setEqGains] = useState([0, 0, 0, 0, 0]);
  
  const [sleepTimer, setSleepTimer] = useState(null); // in seconds
  const sleepTimerRef = useRef(null);
  const fadeIntervalRef = useRef(null);

  // Web Audio Advanced DSP Refs
  const karaokeInputRef = useRef(null);
  const karaokeDryGainRef = useRef(null);
  const karaokeWetGainRef = useRef(null);
  const spatialInputRef = useRef(null);
  const spatialDryGainRef = useRef(null);
  const spatialWetGainRef = useRef(null);
  const convolverRef = useRef(null);

  // Advanced DSP States
  const [spatialPreset, setSpatialPreset] = useState("none");
  const [karaokeEnabled, setKaraokeEnabled] = useState(false);
  const [crossfade, setCrossfade] = useState(3); // transition fading duration in seconds

  const [customLyrics, setCustomLyrics] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_lyrics');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const generateReverbImpulse = (ctx, preset) => {
    let duration;
    let decay;
    
    switch (preset) {
      case "concert":
        duration = 2.5; decay = 2.0;
        break;
      case "cathedral":
        duration = 4.0; decay = 1.5;
        break;
      case "cave":
        duration = 3.0; decay = 1.0;
        break;
      case "club":
        duration = 1.0; decay = 3.0;
        break;
      case "bathroom":
        duration = 0.6; decay = 1.8;
        break;
      default:
        return null;
    }

    const sampleRate = ctx.sampleRate;
    const length = sampleRate * duration;
    const impulse = ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const percent = i / length;
      const val = (Math.random() * 2 - 1) * Math.pow(1 - percent, decay);
      left[i] = val;
      right[i] = val;
    }
    return impulse;
  };

  const applySpatialPreset = (presetName) => {
    setSpatialPreset(presetName);
    initAudioContext();

    const ctx = audioContextRef.current;
    if (ctx && spatialDryGainRef.current && spatialWetGainRef.current && convolverRef.current) {
      if (presetName === "none") {
        spatialDryGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);
        spatialWetGainRef.current.gain.setValueAtTime(0.0, ctx.currentTime);
      } else {
        const buffer = generateReverbImpulse(ctx, presetName);
        convolverRef.current.buffer = buffer;
        spatialDryGainRef.current.gain.setValueAtTime(0.65, ctx.currentTime);
        spatialWetGainRef.current.gain.setValueAtTime(0.75, ctx.currentTime);
      }
    }
  };

  const toggleKaraoke = () => {
    const nextVal = !karaokeEnabled;
    setKaraokeEnabled(nextVal);
    initAudioContext();

    const ctx = audioContextRef.current;
    if (ctx && karaokeDryGainRef.current && karaokeWetGainRef.current) {
      if (nextVal) {
        karaokeDryGainRef.current.gain.setValueAtTime(0.0, ctx.currentTime);
        karaokeWetGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);
      } else {
        karaokeDryGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);
        karaokeWetGainRef.current.gain.setValueAtTime(0.0, ctx.currentTime);
      }
    }
  };

  const saveCustomLyrics = (songId, timedLyricsArray) => {
    setCustomLyrics(prev => {
      const updated = { ...prev, [songId]: timedLyricsArray };
      localStorage.setItem('custom_lyrics', JSON.stringify(updated));
      return updated;
    });
  };

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [isLibraryLoading, setIsLibraryLoading] = useState(true);
  const [libraryError, setLibraryError] = useState("");
  const [customPlaylists, setCustomPlaylists] = useState(() => {
    try {
      const saved = localStorage.getItem('custom_playlists');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [playlistModalSong, setPlaylistModalSong] = useState(null);

  const openPlaylistModal = (song) => {
    setPlaylistModalSong(song);
    setPlaylistModalOpen(true);
  };

  const closePlaylistModal = () => {
    setPlaylistModalSong(null);
    setPlaylistModalOpen(false);
  };

  const [importModalOpen, setImportModalOpen] = useState(false);

  const openImportModal = () => {
    setImportModalOpen(true);
  };

  const closeImportModal = () => {
    setImportModalOpen(false);
  };

  const addSongToPlaylist = async (song, playlistId) => {
    if (!song) return { success: false, message: "No song selected." };
    let success = false;
    let message = "";

    const trackToAdd = {
      _id: song._id || song.id,
      name: song.name,
      image: song.image,
      desc: song.desc || song.artist || "Unknown Artist",
      file: song.file,
      duration: song.duration || "3:00",
      album: song.album || "Single"
    };

    setCustomPlaylists(prev => {
      const updated = prev.map(p => {
        if (p._id === playlistId) {
          const exists = p.tracks.some(t => t._id === trackToAdd._id);
          if (exists) {
            message = "Song is already in this playlist!";
            return p;
          }
          success = true;
          const newTracks = [...p.tracks, trackToAdd];
          return {
            ...p,
            tracks: newTracks,
            image: p.tracks.length === 0 ? trackToAdd.image : p.image
          };
        }
        return p;
      });
      if (success) {
        localStorage.setItem('custom_playlists', JSON.stringify(updated));
      }
      return updated;
    });

    if (success) {
      return { success: true, message: "Added to playlist!" };
    } else {
      return { success: false, message: message || "Playlist not found." };
    }
  };

  const removeSongFromPlaylist = (songId, playlistId) => {
    setCustomPlaylists(prev => {
      const updated = prev.map(p => {
        if (p._id === playlistId) {
          const newTracks = p.tracks.filter(t => t._id !== songId);
          return {
            ...p,
            tracks: newTracks,
            image: newTracks.length > 0 ? newTracks[0].image : FALLBACK_COVER
          };
        }
        return p;
      });
      localStorage.setItem('custom_playlists', JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: "Removed from playlist!" };
  };

  const createEmptyPlaylist = (name) => {
    const newPlaylist = {
      _id: `custom_playlist_${Date.now()}`,
      name: name || "My Custom Playlist",
      desc: "Custom user playlist.",
      image: FALLBACK_COVER,
      bgColour: "rgb(0, 136, 255)",
      tracks: []
    };
    setCustomPlaylists(prev => {
      const updated = [newPlaylist, ...prev];
      localStorage.setItem('custom_playlists', JSON.stringify(updated));
      return updated;
    });
    return newPlaylist;
  };

  const deletePlaylist = (playlistId) => {
    setCustomPlaylists(prev => {
      const updated = prev.filter(p => p._id !== playlistId);
      localStorage.setItem('custom_playlists', JSON.stringify(updated));
      return updated;
    });
    return { success: true, message: "Playlist deleted!" };
  };
  
  const [currentSong, setCurrentSong] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoop, setIsLoop] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [progress, setProgress] = useState(0);
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 }
  });


  // Theme states
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
      root.classList.remove('light');
    }
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      console.error("Failed to write theme to localStorage:", e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Auth states
  const [token, setToken] = useState(() => {
    try {
      return localStorage.getItem('token') || '';
    } catch {
      return '';
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [isFullScreen, setIsFullScreen] = useState(false);

  const [likedSongs, setLikedSongs] = useState(() => {
    try {
      const saved = localStorage.getItem('liked_songs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleLikeSong = (songId) => {
    let updated;
    if (likedSongs.includes(songId)) {
      updated = likedSongs.filter(id => id !== songId);
    } else {
      updated = [...likedSongs, songId];
    }
    setLikedSongs(updated);
    localStorage.setItem('liked_songs', JSON.stringify(updated));
  };

  // Queue states
  const [currentQueue, setCurrentQueue] = useState([]);
  const currentQueueRef = useRef([]);

  // Track playback state in local variables to avoid closure issues in event listeners
  const currentSongRef = useRef(null);
  const songsDataRef = useRef([]);
  const isShuffleRef = useRef(false);

  const [recentlyPlayed, setRecentlyPlayed] = useState(() => {
    try {
      const saved = localStorage.getItem('recently_played');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const addToRecentlyPlayed = (song) => {
    if (!song) return;
    setRecentlyPlayed(prev => {
      const filtered = prev.filter(s => s._id !== song._id);
      const updated = [song, ...filtered].slice(0, 12);
      try {
        localStorage.setItem('recently_played', JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recently played:", e);
      }
      return updated;
    });
  };


  useEffect(() => {
    // Set CORS for Audio element so Web Audio API works without CORS errors
    if (audioRef.current) {
      audioRef.current.crossOrigin = "anonymous";
    }
  }, []);

  useEffect(() => {
    currentSongRef.current = currentSong;
    if (currentSong) {
      setTimeout(() => {
        addToRecentlyPlayed(currentSong);
      }, 0);
      if (currentSong.image) {
        extractDominantColor(currentSong.image).then((colorStr) => {
          document.documentElement.style.setProperty('--song-theme-color', colorStr);
        });
      }
    }
  }, [currentSong]);

  useEffect(() => {
    songsDataRef.current = songsData;
    if (songsData.length > 0 && currentQueue.length === 0) {
      const timer = setTimeout(() => {
        setCurrentQueue(songsData);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [songsData, currentQueue]);

  useEffect(() => {
    isShuffleRef.current = isShuffle;
  }, [isShuffle]);

  useEffect(() => {
    currentQueueRef.current = currentQueue;
  }, [currentQueue]);

  // Fetch initial songs and albums
  const fetchData = async () => {
    setIsLibraryLoading(true);
    setLibraryError("");
    try {
      const [albumsRes, songsRes] = await Promise.all([
        axios.get(`${API_URL}/api/album/list`),
        axios.get(`${API_URL}/api/song/list`)
      ]);
      
      setAlbumsData(albumsRes.data.albums || []);
      setSongsData(songsRes.data.songs || []);

      if (songsRes.data.songs && songsRes.data.songs.length > 0) {
        // Set the first song as active but paused initially
        setCurrentSong(songsRes.data.songs[0]);
        audioRef.current.src = songsRes.data.songs[0].file;
      }
    } catch (error) {
      console.error("Error loading library data from backend:", error);
      setLibraryError("Database connection failed. Please ensure the backend server is running and database is accessible.");
      setAlbumsData([]);
      setSongsData([]);
      setCurrentQueue([]);
    } finally {
      setIsLibraryLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${savedToken}` }
          });
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('user', JSON.stringify(res.data.user));
          } else {
            logoutUser();
          }
        } catch (err) {
          console.error("Session verification failed, logging out:", err);
          logoutUser();
        }
      }
    };
    verifySession();
  }, [token]);

  // Auth Handlers
  const loginUser = async (email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Login failed." };
    }
  };

  const registerUser = async (name, email, password) => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      if (res.data.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        return { success: true, user: res.data.user };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      console.error(err);
      return { success: false, message: err.response?.data?.message || "Registration failed." };
    }
  };

  function logoutUser() {
    setToken('');
    setUser(null);
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.error("Failed to clear auth from localStorage:", e);
    }
  }


  const createPlaylist = async (name, tracks) => {
    if (!tracks || tracks.length === 0) return { success: false, message: "No tracks to add." };
    
    let dominantColor = "0, 136, 255";
    if (tracks[0] && tracks[0].image) {
      const colorStr = await extractDominantColor(tracks[0].image);
      dominantColor = colorStr;
    }

    const newPlaylist = {
      _id: `custom_playlist_${Date.now()}`,
      name: name || "Imported Playlist",
      desc: `Imported playlist containing ${tracks.length} tracks.`,
      image: tracks[0]?.image || FALLBACK_COVER,
      bgColour: dominantColor.includes(",") ? `rgb(${dominantColor})` : dominantColor,
      tracks: tracks.map((t, idx) => ({
        _id: t._id || t.id || `custom_song_${Date.now()}_${idx}`,
        ...t,
        album: name || "Imported Playlist"
      }))
    };

    const updated = [newPlaylist, ...customPlaylists];
    setCustomPlaylists(updated);
    localStorage.setItem('custom_playlists', JSON.stringify(updated));
    return { success: true, playlist: newPlaylist };
  };


  // Update volume on HTML5 Audio
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Initialize Audio events
  useEffect(() => {
    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      if (audio.duration) {
        const curTime = audio.currentTime || 0;
        const durTime = audio.duration || 0;
        setProgress((curTime / durTime) * 100);

        setTime({
          currentTime: {
            second: Math.floor(curTime % 60),
            minute: Math.floor(curTime / 60)
          },
          totalTime: {
            second: Math.floor(durTime % 60),
            minute: Math.floor(durTime / 60)
          }
        });
      }
    };

    const handleEnded = () => {
      if (isLoop) {
        audio.currentTime = 0;
        audio.play().catch(err => console.error("Playback restart failed:", err));
      } else {
        next();
      }
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoop]);

  const initAudioContext = () => {
    if (audioContextRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64; // 32 frequency bins, ideal for lightweight visualizer
      analyserRef.current = analyser;

      // 5 frequency bands: 60Hz, 230Hz, 910Hz, 4kHz, 14kHz
      const freqs = [60, 230, 910, 4000, 14000];
      const filters = freqs.map((freq, idx) => {
        const filter = ctx.createBiquadFilter();
        filter.type = idx === 0 ? "lowshelf" : idx === freqs.length - 1 ? "highshelf" : "peaking";
        filter.frequency.value = freq;
        filter.Q.value = 1.0;
        filter.gain.value = eqGains[idx]; // Start with current manual gains
        return filter;
      });

      filtersRef.current = filters;

      // 3. Karaoke Nodes (Vocal Attenuation)
      const kInput = ctx.createGain();
      const kOutput = ctx.createGain();
      const kDry = ctx.createGain();
      const kWet = ctx.createGain();
      
      const kLowPass = ctx.createBiquadFilter();
      kLowPass.type = "lowpass";
      kLowPass.frequency.value = 200; // Low bass bypasses cancellation

      const kHighPass = ctx.createBiquadFilter();
      kHighPass.type = "highpass";
      kHighPass.frequency.value = 200;

      const kSplitter = ctx.createChannelSplitter(2);
      const kMerger = ctx.createChannelMerger(2);
      const kGainL = ctx.createGain();
      const kGainR = ctx.createGain();
      kGainL.gain.value = 0.5;
      kGainR.gain.value = -0.5; // Invert right channel for L-R subtraction

      // Connections inside Karaoke
      kInput.connect(kDry);
      kDry.connect(kOutput);

      kInput.connect(kLowPass);
      kLowPass.connect(kWet);

      kInput.connect(kHighPass);
      kHighPass.connect(kSplitter);
      
      kSplitter.connect(kGainL, 0); // Left channel
      kGainL.connect(kMerger, 0, 0);
      kGainL.connect(kMerger, 0, 1);

      kSplitter.connect(kGainR, 1); // Right channel
      kGainR.connect(kMerger, 0, 0);
      kGainR.connect(kMerger, 0, 1);

      kMerger.connect(kWet);
      kWet.connect(kOutput);

      // Save Karaoke refs
      karaokeInputRef.current = kInput;
      karaokeDryGainRef.current = kDry;
      karaokeWetGainRef.current = kWet;
      kDry.gain.value = karaokeEnabled ? 0.0 : 1.0;
      kWet.gain.value = karaokeEnabled ? 1.0 : 0.0;

      // 4. Spatial Audio (Reverb) Nodes
      const sInput = ctx.createGain();
      const sOutput = ctx.createGain();
      const sDry = ctx.createGain();
      const sWet = ctx.createGain();
      const convolver = ctx.createConvolver();

      sInput.connect(sDry);
      sDry.connect(sOutput);

      sInput.connect(convolver);
      convolver.connect(sWet);
      sWet.connect(sOutput);

      spatialInputRef.current = sInput;
      spatialDryGainRef.current = sDry;
      spatialWetGainRef.current = sWet;
      convolverRef.current = convolver;

      // Set initial spatial preset Reverb buffer
      sDry.gain.value = spatialPreset === "none" ? 1.0 : 0.65;
      sWet.gain.value = spatialPreset === "none" ? 0.0 : 0.75;
      if (spatialPreset !== "none") {
        convolver.buffer = generateReverbImpulse(ctx, spatialPreset);
      }

      // Connect overall graph
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceRef.current = source;

      // Connect: Source -> Analyser -> Filter 0 -> ... -> Filter 4 -> Karaoke Input -> Karaoke Output -> Spatial Input -> Spatial Output -> Destination
      source.connect(analyser);
      analyser.connect(filters[0]);
      for (let i = 0; i < filters.length - 1; i++) {
        filters[i].connect(filters[i + 1]);
      }
      filters[filters.length - 1].connect(kInput);
      kOutput.connect(sInput);
      sOutput.connect(ctx.destination);

      console.log("Web Audio EQ, Analyser & Advanced DSP initialized successfully.");
    } catch (e) {
      console.warn("Web Audio API blocked or not supported on this track/origin:", e);
    }
  };

  const applyEqPreset = (presetName) => {
    setEqPreset(presetName);
    const eqPresets = {
      flat: [0, 0, 0, 0, 0],
      bassBoost: [6, 4, 0, 0, -2],
      vocalBoost: [-2, 0, 4, 3, 0],
      trebleBoost: [-3, -1, 0, 4, 6],
      electronic: [5, 2, -1, 2, 4],
      classical: [3, 2, 0, -1, -3]
    };
    const gains = eqPresets[presetName] || eqPresets.flat;
    
    initAudioContext();
    
    if (filtersRef.current.length > 0) {
      filtersRef.current.forEach((filter, idx) => {
        const ctx = audioContextRef.current;
        if (ctx) {
          filter.gain.linearRampToValueAtTime(gains[idx], ctx.currentTime + 0.15);
        } else {
          filter.gain.value = gains[idx];
        }
      });
    }
    setEqGains(gains);
  };

  const changeEqGain = (bandIdx, gainVal) => {
    setEqPreset("custom");
    initAudioContext();
    const val = parseFloat(gainVal);

    setEqGains(prev => {
      const updated = [...prev];
      updated[bandIdx] = val;
      return updated;
    });

    if (filtersRef.current[bandIdx]) {
      const ctx = audioContextRef.current;
      if (ctx) {
        filtersRef.current[bandIdx].gain.linearRampToValueAtTime(val, ctx.currentTime + 0.05);
      } else {
        filtersRef.current[bandIdx].gain.value = val;
      }
    }
  };

  const startSleepTimer = (minutes) => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }

    if (minutes === 0 || minutes === null) {
      setSleepTimer(null);
      return;
    }

    let secondsLeft = minutes * 60;
    setSleepTimer(secondsLeft);

    sleepTimerRef.current = setInterval(() => {
      secondsLeft -= 1;
      setSleepTimer(secondsLeft);

      if (secondsLeft <= 0) {
        clearInterval(sleepTimerRef.current);
        sleepTimerRef.current = null;
        fadeAndPause();
      }
    }, 1000);
  };

  const fadeAndPause = () => {
    const originalVol = volume;
    let currentVol = originalVol;
    const fadeInterval = setInterval(() => {
      currentVol -= 0.05;
      if (currentVol <= 0) {
        clearInterval(fadeInterval);
        audioRef.current.pause();
        setPlayStatus(false);
        audioRef.current.volume = isMuted ? 0 : originalVol;
        setSleepTimer(null);
      } else {
        audioRef.current.volume = currentVol;
      }
    }, 100);
  };

  const fadePlayTrack = (song, queue = null) => {
    if (!song) return;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
      fadeIntervalRef.current = null;
    }

    // If crossfade is 0 or if no song is loaded or paused, play instantly without fading
    if (crossfade === 0 || !audioRef.current.src || audioRef.current.paused) {
      if (queue) setCurrentQueue(queue);
      setCurrentSong(song);
      audioRef.current.src = song.file;
      audioRef.current.load();
      play();
      return;
    }

    const targetVol = isMuted ? 0 : volume;
    let fadeOutVol = targetVol;
    
    // Scale fade step sizes based on crossfade duration
    const crossfadeTimeMs = crossfade * 1000;
    const stepInterval = 40; // ms
    const fadeOutSteps = Math.max(1, (crossfadeTimeMs / 2) / stepInterval);
    const fadeOutStepVal = targetVol / fadeOutSteps;

    fadeIntervalRef.current = setInterval(() => {
      fadeOutVol -= fadeOutStepVal;
      if (fadeOutVol <= 0) {
        clearInterval(fadeIntervalRef.current);
        audioRef.current.volume = 0;
        
        if (queue) setCurrentQueue(queue);
        setCurrentSong(song);
        audioRef.current.src = song.file;
        audioRef.current.load();
        
        if (audioRef.current.src) {
          initAudioContext();
          if (audioContextRef.current && audioContextRef.current.state === "suspended") {
            audioContextRef.current.resume();
          }
          audioRef.current.play()
            .then(() => {
              setPlayStatus(true);
              
              let fadeInVol = 0;
              audioRef.current.volume = 0;
              const fadeInSteps = Math.max(1, (crossfadeTimeMs / 2) / stepInterval);
              const fadeInStepVal = targetVol / fadeInSteps;

              fadeIntervalRef.current = setInterval(() => {
                fadeInVol += fadeInStepVal;
                if (fadeInVol >= targetVol) {
                  clearInterval(fadeIntervalRef.current);
                  fadeIntervalRef.current = null;
                  audioRef.current.volume = targetVol;
                } else {
                  audioRef.current.volume = fadeInVol;
                }
              }, stepInterval);
            })
            .catch(err => console.error("DJ Fade Playback failed:", err));
        }
      } else {
        audioRef.current.volume = Math.max(0, fadeOutVol);
      }
    }, stepInterval);
  };

  const play = () => {
    if (audioRef.current.src) {
      initAudioContext();
      if (audioContextRef.current && audioContextRef.current.state === "suspended") {
        audioContextRef.current.resume();
      }
      audioRef.current.play()
        .then(() => setPlayStatus(true))
        .catch(err => console.error("Failed to start audio playback:", err));
    }
  };

  const pause = () => {
    audioRef.current.pause();
    setPlayStatus(false);
  };

  const togglePlay = () => {
    if (playStatus) {
      pause();
    } else {
      play();
    }
  };

  const playWithId = async (id, customQueue = null) => {
    const queueToUse = customQueue || songsData;
    const song = queueToUse.find(s => s._id === id);
    if (song) {
      fadePlayTrack(song, queueToUse);
    }
  };

  const playTrackDirectly = (song, customQueue = null) => {
    fadePlayTrack(song, customQueue);
  };

  function next() {
    const activeSongs = currentQueueRef.current;
    const activeSong = currentSongRef.current;

    if (activeSongs.length === 0 || !activeSong) return;

    let nextSong;
    if (isShuffleRef.current) {
      const randomIndex = Math.floor(Math.random() * activeSongs.length);
      nextSong = activeSongs[randomIndex];
    } else {
      const currentIndex = activeSongs.findIndex(s => s._id === activeSong._id);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % activeSongs.length;
        nextSong = activeSongs[nextIndex];
      }
    }

    if (nextSong) {
      fadePlayTrack(nextSong, activeSongs);
    }
  }

  const previous = () => {
    const activeSongs = currentQueueRef.current;
    const activeSong = currentSongRef.current;

    if (activeSongs.length === 0 || !activeSong) return;

    let prevSong;
    const currentIndex = activeSongs.findIndex(s => s._id === activeSong._id);
    if (currentIndex !== -1) {
      const prevIndex = currentIndex === 0 ? activeSongs.length - 1 : currentIndex - 1;
      prevSong = activeSongs[prevIndex];
    }

    if (prevSong) {
      fadePlayTrack(prevSong, activeSongs);
    }
  };

  const seek = (e) => {
    if (seekBarRef.current && audioRef.current.duration) {
      const rect = seekBarRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const newPercentage = Math.max(0, Math.min(1, clickX / width));
      
      audioRef.current.currentTime = newPercentage * audioRef.current.duration;
      setProgress(newPercentage * 100);
    }
  };

  const changeVolume = (val) => {
    const newVol = parseFloat(val);
    setVolume(newVol);
    if (newVol > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleLoop = () => {
    setIsLoop(!isLoop);
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
  };

  const removeFromQueue = (songId) => {
    setCurrentQueue(prev => prev.filter(song => song._id !== songId));
  };

  const clearQueue = () => {
    setCurrentQueue([]);
  };

  const contextValue = {
    audioRef,
    seekBarRef,
    songsData,
    albumsData: [...albumsData, ...customPlaylists],
    isLibraryLoading,
    libraryError,
    currentSong,
    setCurrentSong,
    playStatus,
    setPlayStatus,
    volume,
    isMuted,
    isLoop,
    isShuffle,
    progress,
    time,
    token,
    user,
    currentQueue,
    removeFromQueue,
    clearQueue,
    loginUser,
    registerUser,
    logoutUser,
    createPlaylist,
    customPlaylists,
    play,
    pause,
    togglePlay,
    playWithId,
    playTrackDirectly,
    next,
    previous,
    seek,
    changeVolume,
    toggleMute,
    toggleLoop,
    toggleShuffle,
    theme,
    setTheme,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    likedSongs,
    toggleLikeSong,
    refreshLibrary: fetchData,
    isFullScreen,
    setIsFullScreen,
    eqPreset,
    eqGains,
    applyEqPreset,
    changeEqGain,
    analyserRef,
    sleepTimer,
    startSleepTimer,
    recentlyPlayed,
    playlistModalOpen,
    playlistModalSong,
    openPlaylistModal,
    closePlaylistModal,
    importModalOpen,
    openImportModal,
    closeImportModal,
    addSongToPlaylist,
    removeSongFromPlaylist,
    createEmptyPlaylist,
    deletePlaylist,
    spatialPreset,
    applySpatialPreset,
    karaokeEnabled,
    toggleKaraoke,
    crossfade,
    setCrossfade,
    customLyrics,
    saveCustomLyrics
  };


  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;
