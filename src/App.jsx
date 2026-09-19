import React, { useState, useEffect, useRef, useCallback } from "react";
import { Header } from "./components/Header";
import { HomePage } from "./components/HomePage";
import { SearchResults } from "./components/SearchResults";
import { PlayerBar } from "./components/PlayerBar";
import { LyricsView } from "./components/LyricsView";
import { FullScreenPlayer } from "./components/FullScreenPlayer";
import {
  searchMusic,
  fetchSongDetails,
  fetchSongSuggestions,
  fetchSongLyrics,
} from "./services/api";
import { parseLrc } from "./utils/lrcParser";
import { extractArtworkColors } from "./utils/colorExtractor";

export function App() {
  const [query, setQuery] = useState("");
  const [searchData, setSearchData] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isHomeMode, setIsHomeMode] = useState(true);

  // Home songs
  const [homeSongs, setHomeSongs] = useState([]);
  const [featuredSong, setFeaturedSong] = useState(null);

  // Playback state
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off"); // 'off' | 'all' | 'one'
  const [isShuffle, setIsShuffle] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState("320kbps");
  const [availableQualities, setAvailableQualities] = useState([]);
  const [queue, setQueue] = useState([]);
  const [suggestionQueue, setSuggestionQueue] = useState([]);
  const [songHistory, setSongHistory] = useState([]);
  const MAX_HISTORY_ITEMS = 5;

  // Dynamic matching color gradient from song image
  const [palette, setPalette] = useState(null);

  // Lyrics state
  const [lyricsData, setLyricsData] = useState(null);
  const [parsedLyrics, setParsedLyrics] = useState([]);
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);

  // Full screen player state
  const [isFullScreen, setIsFullScreen] = useState(false);

  const audioRef = useRef(null);

  // Load initial home page songs on mount
  // useEffect(() => {
  //   loadHomeSongs();
  // }, []);

  // const loadHomeSongs = async () => {
  //   try {
  //     const data = await searchMusic('Love Me Not');
  //     const songs = data?.data?.songs?.results || [];
  //     const topSong = data?.data?.topQuery?.results?.[0] || songs[0] || null;

  //     setHomeSongs(songs);
  //     setFeaturedSong(topSong);
  //     setQueue(songs);
  //   } catch (err) {
  //     console.error('Failed to load home songs:', err);
  //   }
  // };

  const handleSearch = async (searchTerm) => {
    if (!searchTerm?.trim()) {
      setIsHomeMode(true);
      return;
    }

    setIsHomeMode(false);
    setIsSearching(true);
    try {
      const data = await searchMusic(searchTerm);
      setSearchData(data);
      if (data?.data?.songs?.results) {
        setQueue(data.data.songs.results);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleHomeClick = () => {
    setQuery("");
    setIsHomeMode(true);
  };

  // Helper to pick audio URL from downloadUrl array
  const pickAudioUrl = (urls, preferredQuality = selectedQuality) => {
    if (!urls || urls.length === 0) return null;
    const match = urls.find((u) => u.quality === preferredQuality);
    if (match) return match.url;
    return urls[urls.length - 1].url;
  };

  // Play Song (sends song details + lyrics request + extracts matching colors)
  const pushSongToHistory = useCallback((track) => {
    if (!track?.id) return;

    setSongHistory((prev) => {
      const next = prev.filter((item) => item?.id !== track.id);
      return [track, ...next].slice(0, MAX_HISTORY_ITEMS);
    });
  }, []);

  const loadSuggestionQueue = useCallback(
    async (songId, currentSong = null) => {
      if (!songId) return [];

      try {
        const suggestions = await fetchSongSuggestions(songId, 5);
        const nextBatch = suggestions
          .filter((item) => item.id !== songId)
          .slice(0, 5);
        const batch = currentSong ? [currentSong, ...nextBatch] : nextBatch;
        setSuggestionQueue(batch);
        return batch;
      } catch (err) {
        console.warn("Failed to load suggestion queue:", err);
        return [];
      }
    },
    [],
  );

  const handlePlaySong = async (song, shouldLoadSuggestions = true) => {
    if (!song) return;

    const songId = song.id;
    const title = song.title || song.name;
    const artist =
      song.primaryArtists || song.singers || song.artist || "Unknown";
    const album = song.album || "";
    const artwork =
      song.image?.find((i) => i.quality === "500x500")?.url ||
      song.image?.[0]?.url ||
      "";

    // If clicking current song, toggle play/pause
    if (currentTrack?.id === songId && audioRef.current?.src) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.removeAttribute("src");
      audioRef.current.load();
    }

    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    setIsBuffering(false);

    const previewTrack = {
      id: songId,
      title: title,
      artist: artist,
      album: album,
      artwork,
      duration: song.duration || 0,
      streamUrl: null,
      downloadUrls: [],
      rawDetails: null,
    };

    setCurrentTrack(previewTrack);
    setIsPlaying(false);
    setIsTrackLoading(true);
    setIsBuffering(false);
    setIsLoadingLyrics(true);

    try {
      // 1. Extract matching colors from artwork immediately
      extractArtworkColors(artwork, title).then((extracted) => {
        setPalette(extracted);
      });

      // 2. Fetch song details (to get .mp4 audio stream URLs)
      let details = null;
      if (
        songId &&
        !songId.startsWith("suggested-") &&
        !songId.startsWith("top-") &&
        !songId.startsWith("pl-")
      ) {
        try {
          details = await fetchSongDetails(songId);
        } catch {}
      }

      // If not resolved by direct ID, search live to get real playable .mp4 stream
      if (!details) {
        try {
          const searchQuery =
            `${title} ${artist && artist !== "Artist" ? artist : ""}`.trim();
          const searchRes = await searchMusic(searchQuery);
          const matchedSong =
            searchRes?.data?.songs?.results?.[0] ||
            searchRes?.data?.topQuery?.results?.[0];
          if (matchedSong?.id) {
            details = await fetchSongDetails(matchedSong.id);
          }
        } catch (e) {
          console.warn("Fallback search resolution failed:", e);
        }
      }

      const downloadUrls = details?.downloadUrl || [];
      setAvailableQualities(downloadUrls);

      const streamUrl = pickAudioUrl(downloadUrls, selectedQuality);

      const highResArt =
        details?.image?.find((i) => i.quality === "500x500")?.url || artwork;

      const newTrack = {
        id: details?.id || songId,
        title: details?.name || title,
        artist: details?.artists?.primary?.[0]?.name || artist,
        album: details?.album?.name || album,
        artwork: highResArt,
        duration: details?.duration || song.duration || 0,
        streamUrl,
        downloadUrls,
        rawDetails: details,
      };

      setCurrentTrack(newTrack);
      pushSongToHistory({
        id: newTrack.id,
        title: newTrack.title,
        artist: newTrack.artist,
        album: newTrack.album,
        artwork: newTrack.artwork,
        duration: newTrack.duration,
        streamUrl: newTrack.streamUrl,
        downloadUrls: newTrack.downloadUrls,
        rawDetails: newTrack.rawDetails,
      });
      if (shouldLoadSuggestions) {
        await loadSuggestionQueue(newTrack.id, newTrack);
      }

      if (audioRef.current && streamUrl) {
        audioRef.current.src = streamUrl;
        audioRef.current.load();
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            setIsTrackLoading(false);
            setIsBuffering(false);
          })
          .catch((err) => {
            console.warn("Auto-play blocked or failed:", err);
            setIsPlaying(false);
            setIsTrackLoading(false);
            setIsBuffering(false);
          });
      } else {
        setIsTrackLoading(false);
      }

      // 3. Fetch song lyrics
      const lyrics = await fetchSongLyrics({
        trackName: newTrack.title,
        artistName: newTrack.artist,
        albumName: newTrack.album,
        duration: newTrack.duration,
      });

      setLyricsData(lyrics);
      if (lyrics?.syncedLyrics) {
        setParsedLyrics(parseLrc(lyrics.syncedLyrics));
      } else {
        setParsedLyrics([]);
      }
    } catch (err) {
      console.error("Failed to load song:", err);
    } finally {
      setIsLoadingLyrics(false);
      if (!audioRef.current || !audioRef.current.currentSrc) {
        setIsTrackLoading(false);
      }
    }
  };

  // STOP button action: stops audio and resets time to 0
  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setCurrentTime(0);
    setIsPlaying(false);
    setIsTrackLoading(false);
    setIsBuffering(false);
  };

  // Change Audio Quality (.mp4)
  const handleQualityChange = (newQuality) => {
    setSelectedQuality(newQuality);
    if (!currentTrack || !currentTrack.downloadUrls) return;

    const newUrl = pickAudioUrl(currentTrack.downloadUrls, newQuality);
    if (newUrl && audioRef.current && audioRef.current.src !== newUrl) {
      const savedTime = audioRef.current.currentTime;
      const wasPlaying = isPlaying;
      audioRef.current.src = newUrl;
      audioRef.current.currentTime = savedTime;
      if (wasPlaying) {
        audioRef.current.play().catch(console.error);
      }
    }
  };

  // Download song (.mp4 / .m4a)
  const handleDownloadSong = async (song) => {
    let urlToDownload = null;
    let filename = `${song.title || "song"}.m4a`;

    if (currentTrack?.id === song.id && currentTrack.streamUrl) {
      urlToDownload = currentTrack.streamUrl;
      filename = `${currentTrack.artist} - ${currentTrack.title}.m4a`;
    } else {
      try {
        const details = await fetchSongDetails(song.id);
        const urls = details?.downloadUrl || [];
        urlToDownload = pickAudioUrl(urls, "320kbps");
        const artistName =
          details?.artists?.primary?.[0]?.name ||
          song.primaryArtists ||
          "Artist";
        filename = `${artistName} - ${details?.name || song.title}.m4a`;
      } catch (e) {
        console.error("Failed to get download URL:", e);
      }
    }

    if (!urlToDownload) return;

    const a = document.createElement("a");
    a.href = urlToDownload;
    a.target = "_blank";
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Audio Player Event Handlers
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isTrackLoading || isBuffering) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      setIsTrackLoading(true);
      audioRef.current
        .play()
        .then(() => {
          setIsTrackLoading(false);
          setIsBuffering(false);
        })
        .catch((error) => {
          console.warn("Play request failed:", error);
          setIsTrackLoading(false);
          setIsBuffering(false);
        });
    }
  };

  const handleSeek = (newTime) => {
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (newVolume) => {
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      audioRef.current.muted = newVolume === 0;
    }
  };

  const handleToggleMute = () => {
    if (!audioRef.current) return;
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioRef.current.muted = nextMute;
  };

  const handleNext = useCallback(async () => {
    if (!currentTrack) return;

    const currentIndex = suggestionQueue.findIndex(
      (s) => s.id === currentTrack?.id,
    );

    if (suggestionQueue.length > 0 && currentIndex >= 0) {
      if (currentIndex < suggestionQueue.length - 1) {
        const nextTrack = suggestionQueue[currentIndex + 1];
        await handlePlaySong(nextTrack, false);
        return;
      }

      setIsPlaying(false);
      return;
    }

    if (suggestionQueue.length > 0 && currentIndex === -1) {
      const nextTrack = suggestionQueue[0];
      await handlePlaySong(nextTrack, false);
      return;
    }

    if (queue.length === 0) return;
    const indexInQueue = queue.findIndex((s) => s.id === currentTrack?.id);
    let nextIndex;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      nextIndex = indexInQueue >= queue.length - 1 ? 0 : indexInQueue + 1;
    }
    handlePlaySong(queue[nextIndex], false);
  }, [queue, currentTrack, isShuffle, suggestionQueue]);

  const handlePrev = useCallback(() => {
    if (songHistory.length > 1) {
      const currentIndex = songHistory.findIndex(
        (s) => s.id === currentTrack?.id,
      );
      const prevIndex =
        currentIndex <= 0 ? songHistory.length - 1 : currentIndex - 1;
      const prevTrack = songHistory[prevIndex];
      if (prevTrack && prevTrack.id !== currentTrack.id) {
        handlePlaySong(prevTrack, false);
        return;
      }
    }

    if (suggestionQueue.length > 0 && currentTrack) {
      const currentIndex = suggestionQueue.findIndex(
        (s) => s.id === currentTrack.id,
      );
      if (currentIndex > 0) {
        const prevTrack = suggestionQueue[currentIndex - 1];
        handlePlaySong(prevTrack, false);
        return;
      }
    }

    if (queue.length === 0) return;
    const currentIndex = queue.findIndex((s) => s.id === currentTrack?.id);
    let prevIndex = currentIndex <= 0 ? queue.length - 1 : currentIndex - 1;
    handlePlaySong(queue[prevIndex], false);
  }, [queue, currentTrack, songHistory, suggestionQueue]);

  const handleSongEnded = () => {
    if (repeatMode === "one") {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(console.error);
      }
    } else if (repeatMode === "all") {
      handleNext();
    } else {
      const currentIndex = suggestionQueue.findIndex(
        (s) => s.id === currentTrack?.id,
      );
      if (currentIndex >= 0 && currentIndex < suggestionQueue.length - 1) {
        handleNext();
      } else if (
        currentIndex >= 0 &&
        currentIndex === suggestionQueue.length - 1
      ) {
        handleNext();
      } else {
        const queueIndex = queue.findIndex((s) => s.id === currentTrack?.id);
        if (queueIndex < queue.length - 1) {
          handleNext();
        } else {
          setIsPlaying(false);
        }
      }
    }
  };

  const handleToggleRepeat = () => {
    if (repeatMode === "off") setRepeatMode("all");
    else if (repeatMode === "all") setRepeatMode("one");
    else setRepeatMode("off");
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName))
        return;

      if (e.code === "Space") {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleSeek(Math.min(duration, currentTime + 5));
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleSeek(Math.max(0, currentTime - 5));
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        handleVolumeChange(Math.min(1, volume + 0.1));
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        handleVolumeChange(Math.max(0, volume - 0.1));
      } else if (e.key === "m" || e.key === "M") {
        handleToggleMute();
      } else if (e.key === "l" || e.key === "L") {
        setShowLyrics((prev) => !prev);
      } else if (e.key === "f" || e.key === "F") {
        if (currentTrack) setIsFullScreen((prev) => !prev);
      } else if (e.key === "Escape") {
        setIsFullScreen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentTime, duration, volume, isMuted, isPlaying, currentTrack]);

  return (
    <div className={`app-shell ${!currentTrack ? "no-player" : ""}`}>
      {currentTrack && palette?.glowRgba && (
        <div
          className="ambient-glow"
          style={{
            background: `radial-gradient(circle, ${palette.glowRgba} 0%, transparent 70%)`,
          }}
        />
      )}

      {/* HTML5 Audio element */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onPlay={() => {
          setIsPlaying(true);
          setIsTrackLoading(false);
          setIsBuffering(false);
        }}
        onPause={() => {
          setIsPlaying(false);
          setIsTrackLoading(false);
          setIsBuffering(false);
        }}
        onWaiting={() => {
          setIsBuffering(true);
          setIsTrackLoading(false);
        }}
        onCanPlay={() => {
          setIsBuffering(false);
          setIsTrackLoading(false);
        }}
        onEnded={handleSongEnded}
        preload="auto"
      />

      {/* Top Header */}
      <Header
        query={query}
        setQuery={setQuery}
        onSearch={handleSearch}
        showLyrics={showLyrics}
        setShowLyrics={setShowLyrics}
        hasTrack={Boolean(currentTrack)}
        onHomeClick={handleHomeClick}
      />

      {/* Main Content Area */}
      <main className="main-content">
        <div
          className={`content-grid ${showLyrics && currentTrack ? "with-lyrics" : ""}`}
        >
          {/* Home View or Search View */}
          {isHomeMode ? (
            <HomePage
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onDownloadSong={handleDownloadSong}
            />
          ) : (
            <SearchResults
              searchData={searchData}
              isLoading={isSearching}
              currentTrack={currentTrack}
              isPlaying={isPlaying}
              onPlaySong={handlePlaySong}
              onDownloadSong={handleDownloadSong}
              onSelectAlbum={(album) => {
                setQuery(album.title);
                handleSearch(album.title);
              }}
              onSelectArtist={(artist) => {
                setQuery(artist.title);
                handleSearch(artist.title);
              }}
            />
          )}

          {/* Right: Synced Lyrics & About Song View */}
          {showLyrics && currentTrack && (
            <LyricsView
              lyricsData={lyricsData}
              parsedLyrics={parsedLyrics}
              currentTime={currentTime}
              onSeek={handleSeek}
              onClose={() => setShowLyrics(false)}
              currentTrack={currentTrack}
              isLoading={isLoadingLyrics}
            />
          )}
        </div>
      </main>

      {/* Bottom Playing Bar with Dynamic Matching Gradient */}
      <PlayerBar
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isTrackLoading={isTrackLoading}
        isBuffering={isBuffering}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        selectedQuality={selectedQuality}
        availableQualities={availableQualities}
        showLyrics={showLyrics}
        palette={palette}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onToggleRepeat={handleToggleRepeat}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onNext={handleNext}
        onPrev={handlePrev}
        onQualityChange={handleQualityChange}
        onToggleLyrics={() => setShowLyrics(!showLyrics)}
        onDownload={handleDownloadSong}
        onOpenFullScreen={() => setIsFullScreen(true)}
      />

      {/* Full Screen Player Modal with Dynamic Artwork Matching Gradient */}
      <FullScreenPlayer
        isOpen={isFullScreen}
        onClose={() => setIsFullScreen(false)}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        isTrackLoading={isTrackLoading}
        isBuffering={isBuffering}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        palette={palette}
        parsedLyrics={parsedLyrics}
        lyricsData={lyricsData}
        onPlayPause={handlePlayPause}
        onSeek={handleSeek}
        onNext={handleNext}
        onPrev={handlePrev}
        onToggleShuffle={() => setIsShuffle(!isShuffle)}
        onToggleRepeat={handleToggleRepeat}
        onVolumeChange={handleVolumeChange}
        onToggleMute={handleToggleMute}
        onDownload={handleDownloadSong}
      />
    </div>
  );
}
