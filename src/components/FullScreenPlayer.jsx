import React, { useState, useRef, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Shuffle,
  Volume2,
  VolumeX,
  FileText,
  Minimize2,
  Download,
  Music2,
  Disc,
} from "lucide-react";
import { formatTime, getActiveLyricIndex } from "../utils/lrcParser";

export function FullScreenPlayer({
  isOpen,
  onClose,
  currentTrack,
  isPlaying,
  isTrackLoading,
  isBuffering,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  palette,
  parsedLyrics,
  lyricsData,
  onPlayPause,
  onSeek,
  onNext,
  onPrev,
  onToggleShuffle,
  onToggleRepeat,
  onVolumeChange,
  onToggleMute,
  onDownload,
}) {
  const [activeTab, setActiveTab] = useState("player"); // 'player' | 'lyrics'
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const progressRef = useRef(null);

  const activeIndex = getActiveLyricIndex(parsedLyrics, currentTime);

  // Auto-scroll active lyric line smoothly into center view when on lyrics tab
  useEffect(() => {
    if (
      activeTab === "lyrics" &&
      activeLineRef.current &&
      scrollContainerRef.current
    ) {
      const container = scrollContainerRef.current;
      const activeEl = activeLineRef.current;
      const targetTop =
        activeEl.offsetTop -
        container.clientHeight / 2 +
        activeEl.clientHeight / 2;

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "smooth",
      });
    }
  }, [activeIndex, activeTab]);

  if (!isOpen || !currentTrack) return null;

  const handleProgressBarClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const artworkUrl =
    currentTrack.artwork ||
    "https://www.jiosaavn.com/_i/3.0/artist-default-music.png";
  const showLoadingState = Boolean(isTrackLoading || isBuffering);

  return (
    <div
      className="fullscreen-player-overlay"
      style={{
        background:
          palette?.fullGradient ||
          "radial-gradient(circle at center, #1a1e36 0%, #080808 100%)",
      }}
    >
      {/* Ambient background blurred artwork */}
      <div
        className="fullscreen-ambient-backdrop"
        style={{
          backgroundImage: `url(${artworkUrl})`,
        }}
      />

      {/* Top Header Bar with Switchable Tabs (Player & Lyrics) */}
      <div className="fullscreen-header">
        <div className="fullscreen-header-title">
          <Music2 size={18} color="#fff" />
          <span>Now Playing</span>
        </div>

        {/* Center: Switchable Tabs between Player and Lyrics */}
        <div className="fullscreen-tab-switch">
          <button
            type="button"
            className={`fs-tab-pill ${activeTab === "player" ? "active" : ""}`}
            onClick={() => setActiveTab("player")}
          >
            <Disc size={16} />
            <span>Player</span>
          </button>
          <button
            type="button"
            className={`fs-tab-pill ${activeTab === "lyrics" ? "active" : ""}`}
            onClick={() => setActiveTab("lyrics")}
          >
            <FileText size={16} />
            <span>Lyrics</span>
          </button>
        </div>

        {/* Right: Minimize button */}
        <button
          id="close-fullscreen-btn"
          type="button"
          className="fullscreen-close-btn"
          onClick={onClose}
          title="Minimize to player bar (Esc)"
        >
          <Minimize2 size={18} />
          <span>Minimize</span>
        </button>
      </div>

      {/* Main Full-Screen Section: Switchable between Player and Lyrics */}
      <div className="fullscreen-content-container">
        {activeTab === "player" ? (
          /* SECTION 1: Full-Screen Player View */
          <div className="fullscreen-player-view">
            <div
              className="fullscreen-artwork-wrapper"
              style={{
                boxShadow: `0 24px 70px -10px ${palette?.glowRgba || "rgba(0,0,0,0.85)"}`,
              }}
            >
              <img
                src={artworkUrl}
                alt={currentTrack.title}
                className={`fullscreen-artwork ${isPlaying ? "pulse-glow" : ""}`}
              />
            </div>

            <div className="fullscreen-track-details">
              <h1 className="fullscreen-song-title" title={currentTrack.title}>
                {currentTrack.title}
              </h1>
              <h2 className="fullscreen-artist-name">{currentTrack.artist}</h2>
              {currentTrack.album && (
                <div className="fullscreen-album-name">
                  {currentTrack.album}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SECTION 2: Full-Screen Synced Lyrics View (YouTube Music Style) */
          <div className="fullscreen-lyrics-view" ref={scrollContainerRef}>
            {parsedLyrics && parsedLyrics.length > 0 ? (
              <div className="fullscreen-lyrics-list-centered">
                {parsedLyrics.map((line, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLineRef : null}
                      className={`yt-lyric-line-full ${isActive ? "active" : ""}`}
                      onClick={() => onSeek(line.time)}
                      title={`Jump to ${line.formattedTime}`}
                    >
                      <span className="yt-lyric-text">{line.text}</span>
                    </div>
                  );
                })}
              </div>
            ) : lyricsData?.plainLyrics ? (
              <div className="fullscreen-plain-lyrics-full">
                {lyricsData.plainLyrics}
              </div>
            ) : (
              <div className="fullscreen-no-lyrics">
                <Music2 size={44} color="rgba(255,255,255,0.3)" />
                <p>No synchronized lyrics available for this track</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Controls Deck */}
      <div className="fullscreen-bottom-deck">
        {/* Scrubber */}
        <div className="fullscreen-progress-row">
          <span className="fs-time">{formatTime(currentTime)}</span>
          <div
            id="fullscreen-progress-track"
            className="fullscreen-progress-wrapper"
            ref={progressRef}
            onClick={handleProgressBarClick}
          >
            <div className="fs-track-bg">
              <div
                className="fs-track-fill"
                style={{
                  width: `${progressPercent}%`,
                  background: palette?.primaryRgb || "#ffffff",
                }}
              />
            </div>
          </div>
          <span className="fs-time">{formatTime(duration)}</span>
        </div>

        {/* Control Buttons Group */}
        <div className="fullscreen-controls-row">
          {/* Left tools: Quick Switch to Lyrics / Player */}
          <div className="fs-side-tools left">
            <button
              id="fullscreen-toggle-lyrics-btn"
              type="button"
              className={`fs-icon-btn ${activeTab === "lyrics" ? "active" : ""}`}
              onClick={() =>
                setActiveTab(activeTab === "player" ? "lyrics" : "player")
              }
              title={
                activeTab === "player" ? "Switch to Lyrics" : "Switch to Player"
              }
            >
              {activeTab === "player" ? (
                <FileText size={18} />
              ) : (
                <Disc size={18} />
              )}
              <span>{activeTab === "player" ? "Lyrics" : "Player"}</span>
            </button>
          </div>

          {/* Center Playback Controls */}
          <div className="fs-main-controls">
            <button
              type="button"
              className={`fs-ctrl-btn ${isShuffle ? "active" : ""}`}
              onClick={onToggleShuffle}
              title="Shuffle"
            >
              <Shuffle size={20} />
            </button>

            <button
              id="fullscreen-prev-btn"
              type="button"
              className="fs-ctrl-btn"
              onClick={onPrev}
              title="Previous Track"
            >
              <SkipBack size={26} />
            </button>

            <button
              id="fullscreen-play-pause-btn"
              type="button"
              className={`fs-play-btn ${showLoadingState ? "loading" : ""}`}
              style={{
                backgroundColor: "#ffffff",
                boxShadow: `0 6px 25px ${palette?.glowRgba || "rgba(255,255,255,0.4)"}`,
              }}
              onClick={showLoadingState ? undefined : onPlayPause}
              title={
                showLoadingState ? "Loading..." : isPlaying ? "Pause" : "Play"
              }
              disabled={showLoadingState}
            >
              {showLoadingState ? (
                <span className="play-button-spinner fs-spinner" />
              ) : isPlaying ? (
                <Pause size={30} color="#080808" />
              ) : (
                <Play size={30} color="#080808" style={{ marginLeft: 3 }} />
              )}
            </button>

            <button
              id="fullscreen-next-btn"
              type="button"
              className="fs-ctrl-btn"
              onClick={onNext}
              title="Next Track"
            >
              <SkipForward size={26} />
            </button>

            <button
              type="button"
              className={`fs-ctrl-btn ${repeatMode !== "off" ? "active" : ""}`}
              onClick={onToggleRepeat}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === "one" ? (
                <Repeat1 size={20} />
              ) : (
                <Repeat size={20} />
              )}
            </button>
          </div>

          {/* Right tools: Download & Volume */}
          <div className="fs-side-tools right">
            <button
              id="fullscreen-download-btn"
              type="button"
              className="fs-icon-btn"
              onClick={() => onDownload(currentTrack)}
              title="Download .mp4 song"
            >
              <Download size={18} />
            </button>

            <div className="fs-volume-box">
              <button
                type="button"
                className="fs-icon-btn"
                onClick={onToggleMute}
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX size={18} />
                ) : (
                  <Volume2 size={18} />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="fs-volume-slider"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
