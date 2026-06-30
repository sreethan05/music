import CryptoJS from 'crypto-js';

// Decrypt the encrypted JioSaavn media URL using the static DES key
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
    console.error("Failed to decrypt JioSaavn URL:", error.message);
    return null;
  }
};

// Clean up HTML entities (like &quot; or &amp;) in names and descriptions
const cleanHtmlEntities = (str) => {
  if (!str) return "";
  return str
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
};

// Simple in-memory cache for JioSaavn search results with 5-minute TTL
const searchCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000;

export const searchJioSaavn = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ success: false, message: "Query parameter is required." });
    }

    const normalizedQuery = query.trim().toLowerCase();

    // Check cache
    if (searchCache.has(normalizedQuery)) {
      const cached = searchCache.get(normalizedQuery);
      if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return res.status(200).json({
          success: true,
          data: cached.data,
          fromCache: true
        });
      } else {
        searchCache.delete(normalizedQuery);
      }
    }

    // Call JioSaavn's internal autocomplete/search API
    const saavnUrl = `https://www.jiosaavn.com/api.php?__call=search.getResults&_format=json&_marker=0&api_version=4&ctx=web6sgrp&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(saavnUrl);
    if (!response.ok) {
      throw new Error(`JioSaavn server responded with status: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results || [];

    // Parse and decrypt results
    const formattedSongs = results
      .filter(item => item.type === "song")
      .map(item => {
        let audioUrl = null;
        if (item.more_info && item.more_info.encrypted_media_url) {
          const rawUrl = decryptUrl(item.more_info.encrypted_media_url);
          if (rawUrl) {
            // Upgrade quality from 96kbps to 320kbps for premium feel
            audioUrl = rawUrl.replace('_96.mp4', '_320.mp4');
          }
        }

        // Upgrade thumbnail image quality to high-res 500x500
        let imageUrl = item.image || "";
        if (imageUrl.includes("150x150.jpg")) {
          imageUrl = imageUrl.replace("150x150.jpg", "500x500.jpg");
        }

        // Format duration to mm:ss
        const durationSec = parseInt(item.more_info?.duration || "180", 10);
        const minutes = Math.floor(durationSec / 60);
        const seconds = durationSec % 60;
        const durationStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

        // Get primary artists names joined
        let artists = "Unknown Artist";
        if (item.more_info?.artistMap?.primary_artists) {
          artists = item.more_info.artistMap.primary_artists.map(a => a.name).join(", ");
        }

        return {
          id: item.id,
          name: cleanHtmlEntities(item.title),
          desc: cleanHtmlEntities(artists),
          album: cleanHtmlEntities(item.more_info?.album || "Single"),
          image: imageUrl,
          file: audioUrl,
          duration: durationStr
        };
      })
      .filter(song => song.file !== null); // Filter out any track that failed to decrypt

    // Cache the formatted songs
    searchCache.set(normalizedQuery, {
      timestamp: Date.now(),
      data: formattedSongs
    });

    res.status(200).json({
      success: true,
      data: formattedSongs
    });
  } catch (error) {
    console.error("JioSaavn search API error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
