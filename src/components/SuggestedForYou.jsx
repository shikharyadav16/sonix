import React, { useState } from 'react';
import { MoreVertical, Play, Download } from 'lucide-react';

const FALLBACK_ART = 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80';

function getBestImage(images) {
  if (!images) return FALLBACK_ART;
  if (typeof images === 'string') return images;
  if (Array.isArray(images) && images.length > 0) {
    const highQuality = images.find((img) => img.quality === '500x500') || images[images.length - 1];
    return highQuality?.url || FALLBACK_ART;
  }
  return FALLBACK_ART;
}

export function SuggestedForYou({
  songs,
  currentTrack,
  isPlaying,
  onPlaySong,
  onDownloadSong,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  if (!songs || songs.length === 0) return null;

  // Split into two columns of 4 songs each (total 8 songs)
  const leftColumn = songs.slice(0, 4);
  const rightColumn = songs.slice(4, 8);

  const handleToggleMenu = (e, id) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === id ? null : id));
  };

  const renderSongRow = (song, idx, colPrefix) => {
    const isCurrent = currentTrack?.id === song.id || currentTrack?.title === song.title;
    const isSongPlaying = isCurrent && isPlaying;
    const rowKey = song.id || `${colPrefix}-${idx}`;
    const artworkUrl = getBestImage(song.image);
    const artistText = song.primaryArtists || song.singers || song.artist || 'Artist';

    return (
      <div
        key={rowKey}
        className={`suggested-row ${isCurrent ? 'selected-active' : ''}`}
        onClick={() => onPlaySong(song)}
      >
        {/* 64x64 Square Artwork */}
        <div className="suggested-art-wrapper">
          <img
            src={artworkUrl}
            alt={song.title}
            className="suggested-art-img"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = FALLBACK_ART;
            }}
          />
          {isSongPlaying && (
            <div className="suggested-playing-indicator">
              <span className="sound-wave-bar"></span>
              <span className="sound-wave-bar"></span>
              <span className="sound-wave-bar"></span>
            </div>
          )}
        </div>

        {/* Text Details: Artist above, Song Title below */}
        <div className="suggested-meta">
          <span className="suggested-artist" title={artistText}>
            {artistText}
          </span>
          <span className="suggested-title" title={song.title}>
            {song.title}
          </span>
        </div>

        {/* Far Right: 3-dot Vertical Menu */}
        <div className="suggested-menu-wrapper" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className="suggested-dots-btn"
            onClick={(e) => handleToggleMenu(e, rowKey)}
            title="More options"
          >
            <MoreVertical size={18} />
          </button>

          {openMenuId === rowKey && (
            <div className="suggested-dropdown-menu">
              <button
                type="button"
                className="suggested-dropdown-item"
                onClick={() => {
                  setOpenMenuId(null);
                  onPlaySong(song);
                }}
              >
                <Play size={14} />
                <span>Play Now</span>
              </button>

              <button
                type="button"
                className="suggested-dropdown-item"
                onClick={() => {
                  setOpenMenuId(null);
                  onDownloadSong(song);
                }}
              >
                <Download size={14} />
                <span>Download .mp4</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="suggested-section">
      {/* Section Header */}
      <h2 className="suggested-header-title">Suggested for You</h2>

      {/* Two-Column Recommendation Grid */}
      <div className="suggested-grid">
        <div className="suggested-column">
          {leftColumn.map((song, idx) => renderSongRow(song, idx, 'left'))}
        </div>

        <div className="suggested-column">
          {rightColumn.map((song, idx) => renderSongRow(song, idx, 'right'))}
        </div>
      </div>
    </section>
  );
}
