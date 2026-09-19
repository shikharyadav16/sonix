/**
 * Service to execute and inspect the 3 types of requests:
 * 1. Search Request: /api/search?query=...
 * 2. Song Stream/Details Request: /api/songs/:id
 * 3. About Song / Lyrics Request: lrclib.net/api/get
 */

// Global listeners for live request inspection
const requestListeners = new Set();

export function subscribeToRequests(listener) {
  requestListeners.add(listener);
  return () => requestListeners.delete(listener);
}

// Stores the last request/response details for each of the 3 types
export const requestHistory = {
  search: null,
  song: null,
  lyrics: null,
};

function recordRequest(type, data) {
  requestHistory[type] = {
    type,
    timestamp: new Date().toLocaleTimeString(),
    ...data,
  };
  requestListeners.forEach((fn) => fn(requestHistory));
}

/**
 * 1. Search Request
 * Returns { success: true, data: { topQuery, songs, albums, artists, playlists } }
 */
export async function searchMusic(query) {
  if (!query || !query.trim()) return null;

  const url = `/api/search?query=${encodeURIComponent(query.trim())}`;
  const startTime = performance.now();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!res.ok) {
      throw new Error(`Search request failed: HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();

    recordRequest('search', {
      url,
      query,
      status: res.status,
      latencyMs: elapsed,
      response: json,
      error: null,
    });

    return json;
  } catch (err) {
    const elapsed = Math.round(performance.now() - startTime);
    recordRequest('search', {
      url,
      query,
      status: 'Error',
      latencyMs: elapsed,
      response: null,
      error: err.message,
    });
    throw err;
  }
}

/**
 * 2. Song Audio Stream & Details Request
 * Fetches song details by ID, providing .mp4 audio stream downloadUrls
 */
export async function fetchSongDetails(songId) {
  if (!songId) return null;

  const url = `/api/songs/${encodeURIComponent(songId)}`;
  const startTime = performance.now();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        accept: '*/*',
      },
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!res.ok) {
      throw new Error(`Song details request failed: HTTP ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    const songData = json?.data?.[0] || null;

    recordRequest('song', {
      url,
      songId,
      status: res.status,
      latencyMs: elapsed,
      response: json,
      songData,
      audioUrls: songData?.downloadUrl || [],
      error: null,
    });

    return songData;
  } catch (err) {
    const elapsed = Math.round(performance.now() - startTime);
    recordRequest('song', {
      url,
      songId,
      status: 'Error',
      latencyMs: elapsed,
      response: null,
      songData: null,
      error: err.message,
    });
    throw err;
  }
}

/**
 * Clean artist name (remove 'feat.', '&', etc. for better LRCLIB hit rate)
 */
function cleanArtist(artist) {
  if (!artist) return '';
  return artist.split(/,|&|feat\.|ft\./i)[0].trim();
}

/**
 * 3. Fetch About the Song / Lyrics Request
 * Queries LRCLIB for lyrics and song metadata
 */
export async function fetchSongLyrics({ trackName, artistName, albumName, duration }) {
  if (!trackName || !artistName) return null;

  const primaryArtist = cleanArtist(artistName);

  const params = new URLSearchParams();
  params.set('track_name', trackName);
  params.set('artist_name', primaryArtist);
  if (albumName) params.set('album_name', albumName);
  if (duration) params.set('duration', String(Math.round(duration)));

  const url = `/api/lrclib/get?${params.toString()}`;
  const directUrl = `https://lrclib.net/api/get?${params.toString()}`;
  const startTime = performance.now();

  // Try proxy first, then direct fallback
  let responseData = null;
  let status = 200;

  try {
    let res = await fetch(url, { headers: { accept: '*/*' } });
    if (!res.ok) {
      // Try direct call (LRCLIB supports CORS *)
      res = await fetch(directUrl);
    }

    if (!res.ok && res.status === 404) {
      // Try search endpoint if exact get is 404
      const searchUrl = `https://lrclib.net/api/search?q=${encodeURIComponent(`${trackName} ${primaryArtist}`)}`;
      const searchRes = await fetch(searchUrl);
      if (searchRes.ok) {
        const searchResults = await searchRes.json();
        if (Array.isArray(searchResults) && searchResults.length > 0) {
          responseData = searchResults[0];
        }
      }
    } else if (res.ok) {
      responseData = await res.json();
    }

    const elapsed = Math.round(performance.now() - startTime);

    recordRequest('lyrics', {
      url: responseData ? directUrl : url,
      params: { trackName, artistName: primaryArtist, albumName, duration },
      status: responseData ? 200 : 404,
      latencyMs: elapsed,
      response: responseData,
      error: responseData ? null : 'No lyrics found on LRCLIB',
    });

    return responseData;
  } catch (err) {
    const elapsed = Math.round(performance.now() - startTime);
    recordRequest('lyrics', {
      url: directUrl,
      params: { trackName, artistName: primaryArtist, albumName, duration },
      status: 'Error',
      latencyMs: elapsed,
      response: null,
      error: err.message,
    });
    return null;
  }
}
