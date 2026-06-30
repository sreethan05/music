import CryptoJS from 'crypto-js';

// Reusable DES decryption from saavnController
const decryptUrl = (encryptedUrl) => {
  try {
    const key = CryptoJS.enc.Utf8.parse('38346591');
    const decrypted = CryptoJS.DES.decrypt(
      { ciphertext: CryptoJS.enc.Base64.parse(encryptedUrl) },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    return decrypted.toString(CryptoJS.enc.Utf8).trim();
  } catch (error) {
    console.error("Failed to decrypt JioSaavn URL in importer:", error.message);
    return null;
  }
};

const cleanHtmlEntities = (str) => {
  if (!str) return "";
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

// Traverse dynamic YTM JSON nested objects recursively to collect renderers
const findRenderers = (obj, results = []) => {
  if (!obj || typeof obj !== 'object') return results;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      findRenderers(item, results);
    }
  } else {
    if (obj.musicResponsiveListItemRenderer) {
      results.push(obj.musicResponsiveListItemRenderer);
    } else {
      for (const key of Object.keys(obj)) {
        findRenderers(obj[key], results);
      }
    }
  }
  return results;
};

// Process array in chunks for parallel execution with concurrency limit
const chunkPromiseAll = async (array, callback, chunkSize = 8) => {
  const results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    const chunk = array.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(chunk.map(callback));
    results.push(...chunkResults);
  }
  return results;
};

// Maps a JioSaavn API track object to a standard Music Vibe track
const mapJioSaavnSong = (item) => {
  let audioUrl = null;
  if (item.more_info && item.more_info.encrypted_media_url) {
    const rawUrl = decryptUrl(item.more_info.encrypted_media_url);
    if (rawUrl) {
      audioUrl = rawUrl.replace('_96.mp4', '_320.mp4');
    }
  }

  let imageUrl = item.image || "";
  if (imageUrl.includes("150x150.jpg")) {
    imageUrl = imageUrl.replace("150x150.jpg", "500x500.jpg");
  }

  const durationSec = parseInt(item.more_info?.duration || "180", 10);
  const minutes = Math.floor(durationSec / 60);
  const seconds = durationSec % 60;
  const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  let artists = "Unknown Artist";
  if (item.more_info?.artistMap?.primary_artists) {
    artists = item.more_info.artistMap.primary_artists.map(a => a.name).join(", ");
  } else if (item.more_info?.music) {
    artists = item.more_info.music;
  }

  return {
    name: cleanHtmlEntities(item.title || item.song || "Unknown Song"),
    desc: cleanHtmlEntities(artists),
    album: cleanHtmlEntities(item.more_info?.album || "Single"),
    image: imageUrl,
    file: audioUrl,
    duration: durationStr
  };
};

export const importPlaylist = async (req, res) => {
  try {
    const { url, textList, name } = req.body;

    let playlistName = name || "Imported Playlist";
    let tracksToResolve = [];
    let isNativeSaavn = false;
    let nativeTracks = [];

    // 1. Parse Input Source
    if (url) {
      const trimmedUrl = url.trim();

      // CASE A: Spotify Playlist Link
      if (trimmedUrl.includes("spotify.com")) {
        const match = trimmedUrl.match(/\/playlist\/([a-zA-Z0-9]+)/);
        if (!match) {
          return res.status(400).json({ success: false, message: "Invalid Spotify playlist URL." });
        }
        const playlistId = match[1];
        const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;

        console.log(`[Import] Fetching Spotify playlist embed: ${playlistId}`);
        const response = await fetch(embedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Referer': 'https://open.spotify.com/'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch Spotify playlist metadata. Status: ${response.status}`);
        }

        const html = await response.text();
        const nextDataRegex = /<script[^>]*id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/;
        const nextDataMatch = nextDataRegex.exec(html);

        if (!nextDataMatch) {
          throw new Error("Could not parse Spotify page state block.");
        }

        const json = JSON.parse(nextDataMatch[1]);
        const entity = json.props?.pageProps?.state?.data?.entity;

        if (!entity || !entity.trackList) {
          throw new Error("Spotify playlist track list is empty or private.");
        }

        playlistName = name || entity.name || "Spotify Playlist";
        tracksToResolve = entity.trackList.map(track => ({
          title: track.title,
          artist: track.subtitle || "Unknown Artist"
        }));
      }

      // CASE B: YouTube Music or standard YouTube Playlist
      else if (trimmedUrl.includes("youtube.com")) {
        const match = trimmedUrl.match(/[&?]list=([a-zA-Z0-9_-]+)/);
        if (!match) {
          return res.status(400).json({ success: false, message: "Invalid YouTube playlist URL." });
        }
        const playlistId = match[1];
        const ytUrl = `https://music.youtube.com/playlist?list=${playlistId}`;

        console.log(`[Import] Fetching YouTube Music playlist: ${playlistId}`);
        const response = await fetch(ytUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9'
          }
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch YouTube Music metadata. Status: ${response.status}`);
        }

        const html = await response.text();
        const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/g;
        let matchScript;
        let ytDataStr = "";

        while ((matchScript = scriptRegex.exec(html)) !== null) {
          const js = matchScript[1];
          if (js.includes('ytInitialData') && js.includes('musicResponsiveListItemRenderer')) {
            ytDataStr = js;
            break;
          }
        }

        if (!ytDataStr) {
          throw new Error("Could not extract YouTube Music playlist track list.");
        }

        const jsonStart = ytDataStr.indexOf('{');
        const jsonEnd = ytDataStr.lastIndexOf('}');
        if (jsonStart === -1 || jsonEnd === -1) {
          throw new Error("Invalid YouTube Music state format.");
        }

        const rawJson = ytDataStr.substring(jsonStart, jsonEnd + 1);
        const decodedJsonStr = rawJson.replace(/\\x([0-9a-fA-F]{2})/g, (m, hex) => {
          return String.fromCharCode(parseInt(hex, 16));
        });

        const json = JSON.parse(decodedJsonStr);
        const renderers = findRenderers(json);

        if (renderers.length === 0) {
          throw new Error("No tracks found in public YouTube Music playlist.");
        }

        try {
          const header = json.header?.musicDetailHeaderRenderer;
          if (header?.title?.runs?.[0]?.text) {
            playlistName = name || header.title.runs[0].text;
          }
        } catch (_) {}

        tracksToResolve = renderers.map(renderer => {
          const columns = renderer.flexColumns;
          if (columns && columns.length >= 2) {
            const title = columns[0].musicResponsiveListItemFlexColumnRenderer?.text?.runs?.[0]?.text;
            const artistRuns = columns[1].musicResponsiveListItemFlexColumnRenderer?.text?.runs;
            let artist = "Unknown Artist";
            if (artistRuns) {
              artist = artistRuns.map(r => r.text).filter(t => t !== ' • ' && t !== ' & ').join('');
            }
            if (title) {
              return { title, artist };
            }
          }
          return null;
        }).filter(Boolean);
      }

      // CASE C: JioSaavn Playlist Link
      else if (trimmedUrl.includes("jiosaavn.com")) {
        let listId = "";
        const paramMatch = trimmedUrl.match(/[?&]listid=([a-zA-Z0-9_-]+)/);
        if (paramMatch) {
          listId = paramMatch[1];
        } else {
          const parts = trimmedUrl.split('/');
          listId = parts[parts.length - 1] || parts[parts.length - 2];
        }

        if (!listId) {
          return res.status(400).json({ success: false, message: "Invalid JioSaavn playlist URL." });
        }

        console.log(`[Import] Querying JioSaavn playlist ID: ${listId}`);
        const saavnUrl = `https://www.jiosaavn.com/api.php?__call=playlist.getDetails&_format=json&cc=in&_marker=0&api_version=4&listid=${listId}`;
        const response = await fetch(saavnUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch JioSaavn playlist. Status: ${response.status}`);
        }

        const data = await response.json();
        if (!data || !data.list || data.list.length === 0) {
          throw new Error("No tracks found in JioSaavn playlist.");
        }

        playlistName = name || data.listname || "JioSaavn Import";
        isNativeSaavn = true;

        nativeTracks = data.list
          .map(mapJioSaavnSong)
          .filter(song => song.file !== null);
      }

      else {
        return res.status(400).json({ success: false, message: "Unsupported playlist link platform." });
      }
    }

    // CASE D: Plain Text Import (Deezer, Tidal, Apple Music copy-pastes)
    else if (textList) {
      const lines = textList.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
      if (lines.length === 0) {
        return res.status(400).json({ success: false, message: "Pasted text list is empty." });
      }

      playlistName = name || "Imported Tracks";
      tracksToResolve = lines.map(line => {
        let cleanLine = line
          .replace(/^\d+[\s.\-_|)]+/, "") 
          .replace(/^\[\d+\]\s*/, "")    
          .trim();

        cleanLine = cleanLine
          .replace(/\(\d{1,2}:\d{2}\)$/, "") 
          .replace(/\[\d{1,2}:\d{2}\]$/, "") 
          .trim();

        let title = cleanLine;
        let artist = "Unknown Artist";

        const splitters = [" - ", " – ", " — ", " | ", " by ", " BY ", " : "];
        for (const splitter of splitters) {
          if (cleanLine.includes(splitter)) {
            const parts = cleanLine.split(splitter);
            title = parts[0].trim();
            artist = parts.slice(1).join(splitter).trim();
            break;
          }
        }

        return { title, artist };
      });
    }

    else {
      return res.status(400).json({ success: false, message: "No import source provided." });
    }

    // 2. Resolve Non-Native Tracks on JioSaavn
    if (isNativeSaavn) {
      console.log(`[Import] Natively resolved ${nativeTracks.length} tracks.`);
      return res.status(200).json({
        success: true,
        playlistName,
        tracks: nativeTracks
      });
    }

    console.log(`[Import] Resolving ${tracksToResolve.length} tracks on JioSaavn...`);
    const resolvedTracks = [];

    await chunkPromiseAll(tracksToResolve, async (track) => {
      try {
        const query = `${track.title} ${track.artist}`;
        const searchUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6sgrp&q=${encodeURIComponent(query)}`;
        
        const response = await fetch(searchUrl);
        if (!response.ok) return;

        const data = await response.json();
        const results = data.results || [];
        const firstSong = results.find(item => item.type === "song");

        if (firstSong) {
          const mapped = mapJioSaavnSong(firstSong);
          if (mapped.file) {
            resolvedTracks.push(mapped);
          }
        }
      } catch (err) {
        console.error(`Failed to resolve track: ${track.title}`, err.message);
      }
    }, 10); 

    console.log(`[Import] Successfully resolved ${resolvedTracks.length} of ${tracksToResolve.length} tracks.`);

    res.status(200).json({
      success: true,
      playlistName,
      tracks: resolvedTracks
    });

  } catch (error) {
    console.error("Playlist import controller error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
