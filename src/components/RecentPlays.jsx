import React, { useState, useRef } from 'react';
import { Play, Pause, MoreVertical, Download } from 'lucide-react';

const FALLBACK_ART = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

function getBestImage(images) {
  if (!images) return FALLBACK_ART;
  if (typeof images === 'string') return images;
  if (Array.isArray(images) && images.length > 0) {
    const highQuality = images.find((img) => img.quality === '500x500') || images[images.length - 1];
    return highQuality?.url || FALLBACK_ART;
  }
  return FALLBACK_ART;
}

export function RecentPlays({
  recentSongs,
  currentTrack,
  isPlaying,
  onPlaySong,
  onDownloadSong,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);
  const hasDragged = useRef(false);

  if (!recentSongs || recentSongs.length === 0) return null;

  // Mouse drag-to-scroll support without interfering with native vertical page scrolling
  const handleMouseDown = (e) => {
    // Only left click on track container or cards (not on buttons/menus)
    if (e.button !== 0 || e.target.closest('.recent-dots-btn') || e.target.closest('.recent-dropdown-menu')) return;
    const el = scrollRef.current;
    if (!el) return;

    isDragging.current = true;
    hasDragged.current = false;
    startX.current = e.pageX - el.offsetLeft;
    scrollLeftStart.current = el.scrollLeft;
  };

  const handleMouseMove = (e) => {
    if (!isDragging.current || !scrollRef.current) return;
    const el = scrollRef.current;
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    if (Math.abs(x - startX.current) > 5) {
      hasDragged.current = true;
    }
    el.scrollLeft = scrollLeftStart.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDragging.current = false;
  };

  const handleToggleMenu = (e, songId) => {
    e.stopPropagation();
    setOpenMenuId((prev) => (prev === songId ? null : songId));
  };

  return (
    <section className="recent-plays-section">
      {/* Header: Clean title only */}
      <div className="recent-plays-header">
        <h2 className="recent-plays-title">Recent Plays</h2>
      </div>

      {/* Horizontally scrollable row */}
      <div
        className="recent-plays-container horizontal-row"
        ref={scrollRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        {recentSongs.map((song, idx) => {
          const isCurrent = currentTrack?.id === song.id;
          const isSongPlaying = isCurrent && isPlaying;
          const artworkUrl = getBestImage(song.image);
          const artistText = song.primaryArtists || song.singers || song.artist || 'Artist';

          return (
            <div
              key={song.id || idx}
              className={`recent-card ${isCurrent ? 'current-active' : ''}`}
              onClick={() => {
                if (!hasDragged.current) {
                  onPlaySong(song);
                }
              }}
              title={`Play ${song.title}`}
            >
              {/* Square Album Artwork (3:4 portrait ratio) */}
              <div className="recent-artwork-wrapper">
                <img
                  src={artworkUrl}
                  alt={song.title}
                  className="recent-artwork-img"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ART;
                  }}
                />

                <div className={`recent-play-badge ${isSongPlaying ? 'playing' : ''}`}>
                  {isSongPlaying ? (
                    <Pause size={18} color="#080808" />
                  ) : (
                    <Play size={18} color="#080808" style={{ marginLeft: 2 }} />
                  )}
                </div>
              </div>

              {/* Song Information: Artist + Title & 3-dot Menu */}
              <div className="recent-info-block">
                <div className="recent-artist-name" title={artistText}>
                  {artistText}
                </div>

                <div className="recent-title-row">
                  <span className="recent-song-title" title={song.title}>
                    {song.title}
                  </span>

                  <div className="recent-menu-anchor" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      className="recent-dots-btn"
                      onClick={(e) => handleToggleMenu(e, song.id || idx)}
                      title="More options"
                    >
                      <MoreVertical size={16} />
                    </button>

                    {openMenuId === (song.id || idx) && (
                      <div className="recent-dropdown-menu">
                        <button
                          type="button"
                          className="recent-dropdown-item"
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
                          className="recent-dropdown-item"
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
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
