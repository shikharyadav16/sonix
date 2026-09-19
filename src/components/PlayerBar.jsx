import React, { useRef } from "react";
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
  Download,
  Maximize2,
} from "lucide-react";
import { formatTime } from "../utils/lrcParser";

export function PlayerBar({
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
  selectedQuality,
  availableQualities,
  showLyrics,
  palette,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onNext,
  onPrev,
  onQualityChange,
  onToggleLyrics,
  onDownload,
  onOpenFullScreen,
}) {
  const progressRef = useRef(null);

  const handleProgressBarClick = (e) => {
    if (!progressRef.current || !duration) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * duration);
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const showLoadingState = Boolean(isTrackLoading || isBuffering);

  if (!currentTrack) {
    return null;
  }

  const artworkUrl =
    currentTrack.artwork ||
    "https://www.jiosaavn.com/_i/3.0/artist-default-music.png";

  return (
    <footer
      className="player-bar active"
      style={{
        background: palette?.barGradient || "rgba(10, 12, 22, 0.96)",
        borderColor: palette?.glowRgba || "rgba(255, 255, 255, 0.1)",
      }}
    >
      {/* Mobile Top Razor Progress Indicator (0px vertical space, shows live progress) */}
      <div className="mobile-progress-track">
        <div
          className="mobile-progress-fill"
          style={{
            width: `${progressPercent}%`,
            background: palette?.primaryRgb || "#ffffff",
          }}
        />
      </div>

      {/* 1. Track Info (Clickable to open Full Screen Player) */}
      <div
        className="player-track-info"
        onClick={onOpenFullScreen}
        title="Tap to open Full Screen Player"
      >
        <div className="player-thumb-wrapper">
          <img
            src={artworkUrl}
            alt={currentTrack.title}
            className="player-thumb"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";
            }}
          />
          <div className="player-thumb-overlay">
            <Maximize2 size={16} color="#fff" />
          </div>
        </div>
        <div className="player-track-meta">
          <div className="player-title" title={currentTrack.title}>
            {currentTrack.title}
          </div>
          <div className="player-artist" title={currentTrack.artist}>
            {currentTrack.artist}
          </div>
        </div>
      </div>

      {/* 2. Desktop Center Controls (Visible on desktop ≥ 768px, Hidden on mobile) */}
      <div className="player-center desktop-only">
        <div className="controls-group">
          <button
            id="player-shuffle-btn"
            type="button"
            className={`ctrl-btn ${isShuffle ? "active" : ""}`}
            onClick={onToggleShuffle}
            title="Shuffle"
          >
            <Shuffle size={17} />
          </button>

          <button
            id="player-prev-btn"
            type="button"
            className="ctrl-btn"
            onClick={onPrev}
            title="Previous Track"
          >
            <SkipBack size={20} />
          </button>

          <button
            id="player-play-pause-btn"
            type="button"
            className={`ctrl-btn-play ${showLoadingState ? "loading" : ""}`}
            onClick={showLoadingState ? undefined : onPlayPause}
            title={
              showLoadingState
                ? "Loading..."
                : isPlaying
                  ? "Pause (Space)"
                  : "Play (Space)"
            }
            disabled={showLoadingState}
          >
            {showLoadingState ? (
              <span className="play-button-spinner" />
            ) : isPlaying ? (
              <Pause size={22} />
            ) : (
              <Play size={22} style={{ marginLeft: 2 }} />
            )}
          </button>

          <button
            id="player-next-btn"
            type="button"
            className="ctrl-btn"
            onClick={onNext}
            title="Next Track"
          >
            <SkipForward size={20} />
          </button>

          <button
            id="player-repeat-btn"
            type="button"
            className={`ctrl-btn ${repeatMode !== "off" ? "active" : ""}`}
            onClick={onToggleRepeat}
            title={`Repeat: ${repeatMode}`}
          >
            {repeatMode === "one" ? (
              <Repeat1 size={17} />
            ) : (
              <Repeat size={17} />
            )}
          </button>
        </div>

        {/* Desktop Progress Scrubber */}
        <div className="progress-container">
          <span className="time-tag">{formatTime(currentTime)}</span>
          <div
            id="player-progress-bar"
            className="progress-bar-wrapper"
            ref={progressRef}
            onClick={handleProgressBarClick}
            title="Seek"
          >
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${progressPercent}%`,
                  background: palette?.primaryRgb || "#ffffff",
                }}
              />
            </div>
          </div>
          <span className="time-tag">{formatTime(duration)}</span>
        </div>
      </div>

      {/* 3. Desktop Right Controls (Visible on desktop ≥ 768px, Hidden on mobile) */}
      <div className="player-extra desktop-only">
        {availableQualities && availableQualities.length > 0 && (
          <select
            id="audio-quality-select"
            className="quality-select"
            value={selectedQuality}
            onChange={(e) => onQualityChange(e.target.value)}
            title="Audio Quality (.mp4 stream)"
          >
            {availableQualities.map((q) => (
              <option key={q.quality} value={q.quality}>
                {q.quality}
              </option>
            ))}
          </select>
        )}

        {/* <button
          id="toggle-lyrics-player-btn"
          type="button"
          className={`ctrl-btn ${showLyrics ? 'active' : ''}`}
          onClick={onToggleLyrics}
          title="Toggle Synced Lyrics (L)"
        >
          <FileText size={18} />
        </button> */}

        <button
          id="player-download-btn"
          type="button"
          className="ctrl-btn"
          onClick={() => onDownload(currentTrack)}
          title="Download .mp4 audio stream"
        >
          <Download size={18} />
        </button>

        <div className="volume-wrapper">
          <button
            id="player-mute-btn"
            type="button"
            className="ctrl-btn"
            onClick={onToggleMute}
            title={isMuted ? "Unmute (M)" : "Mute (M)"}
          >
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>
          <input
            id="player-volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="volume-slider"
            title={`Volume: ${Math.round(volume * 100)}%`}
          />
        </div>

        <button
          id="player-fullscreen-btn"
          type="button"
          className="ctrl-btn fullscreen-trigger-btn"
          onClick={onOpenFullScreen}
          title="Open Full Screen Player"
        >
          <Maximize2 size={19} />
        </button>
      </div>

      {/* 4. Mobile Controls (Visible ONLY on mobile < 768px - Essential, Clean, No Overcrowding) */}
      <div className="mobile-player-controls">
        <button
          id="mobile-prev-btn"
          type="button"
          className="ctrl-btn mobile-ctrl-btn mobile-prev-btn"
          onClick={onPrev}
          title="Previous Track"
        >
          <SkipBack size={18} />
        </button>

        <button
          id="mobile-play-pause-btn"
          type="button"
          className={`ctrl-btn-play mobile-play-btn ${showLoadingState ? "loading" : ""}`}
          onClick={showLoadingState ? undefined : onPlayPause}
          title={showLoadingState ? "Loading..." : isPlaying ? "Pause" : "Play"}
          disabled={showLoadingState}
        >
          {showLoadingState ? (
            <span className="play-button-spinner" />
          ) : isPlaying ? (
            <Pause size={20} />
          ) : (
            <Play size={20} style={{ marginLeft: 2 }} />
          )}
        </button>

        <button
          id="mobile-next-btn"
          type="button"
          className="ctrl-btn mobile-ctrl-btn"
          onClick={onNext}
          title="Next Track"
        >
          <SkipForward size={18} />
        </button>

        <button
          id="mobile-expand-player-btn"
          type="button"
          className="ctrl-btn mobile-ctrl-btn mobile-expand-btn"
          onClick={onOpenFullScreen}
          title="Expand to Full Screen Player"
        >
          <Maximize2 size={18} />
        </button>
      </div>
    </footer>
  );
}
