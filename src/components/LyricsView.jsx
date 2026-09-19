import React, { useState, useEffect, useRef } from 'react';
import { getActiveLyricIndex } from '../utils/lrcParser';
import { X, Copy, Check, Music2, Info, Sparkles } from 'lucide-react';

export function LyricsView({
  lyricsData,
  parsedLyrics,
  currentTime,
  onSeek,
  onClose,
  currentTrack,
  isLoading,
}) {
  const [activeTab, setActiveTab] = useState('synced'); // 'synced' | 'plain' | 'about'
  const [copied, setCopied] = useState(false);
  const activeLineRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const activeIndex = getActiveLyricIndex(parsedLyrics, currentTime);

  // Smoothly center the active line inside the lyrics box only (prevents page jump)
  useEffect(() => {
    if (activeTab === 'synced' && activeLineRef.current && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeEl = activeLineRef.current;
      const targetTop =
        activeEl.offsetTop - (container.clientHeight / 2) + (activeEl.clientHeight / 2);

      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: 'smooth',
      });
    }
  }, [activeIndex, activeTab]);

  const handleCopy = () => {
    const content = lyricsData?.plainLyrics || lyricsData?.syncedLyrics || '';
    if (content) {
      navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const hasSynced = parsedLyrics && parsedLyrics.length > 0;
  const hasPlain = Boolean(lyricsData?.plainLyrics);

  return (
    <div className="lyrics-panel yt-style-panel">
      <div className="lyrics-header">
        <div className="lyrics-tabs">
          {hasSynced && (
            <button
              id="tab-synced-lyrics"
              type="button"
              className={`tab-btn ${activeTab === 'synced' ? 'active' : ''}`}
              onClick={() => setActiveTab('synced')}
            >
              <Sparkles size={13} style={{ marginRight: 4, verticalAlign: -1 }} />
              Lyrics
            </button>
          )}

          {hasPlain && (
            <button
              id="tab-plain-lyrics"
              type="button"
              className={`tab-btn ${activeTab === 'plain' ? 'active' : ''}`}
              onClick={() => setActiveTab('plain')}
            >
              Plain
            </button>
          )}

          <button
            id="tab-about-song"
            type="button"
            className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Info size={13} style={{ marginRight: 4, verticalAlign: -1 }} />
            Song Info
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {(hasSynced || hasPlain) && (
            <button
              id="copy-lyrics-btn"
              type="button"
              className="icon-btn-subtle"
              onClick={handleCopy}
              title="Copy Lyrics to clipboard"
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            </button>
          )}

          <button
            id="close-lyrics-panel-btn"
            type="button"
            className="icon-btn-subtle"
            onClick={onClose}
            title="Close panel"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      <div className="lyrics-scroll-box yt-scroll-box" ref={scrollContainerRef}>
        {isLoading ? (
          <div className="state-container">
            <div className="spinner"></div>
            <p>Loading lyrics...</p>
          </div>
        ) : !lyricsData ? (
          <div className="state-container">
            <Music2 size={36} color="#64748b" style={{ marginBottom: 12 }} />
            <p>No lyrics found for this track.</p>
          </div>
        ) : activeTab === 'synced' && hasSynced ? (
          <div className="yt-lyrics-flow">
            {parsedLyrics.map((line, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={idx}
                  ref={isActive ? activeLineRef : null}
                  className={`yt-lyric-line ${isActive ? 'active' : ''}`}
                  onClick={() => onSeek(line.time)}
                  title={`Jump to ${line.formattedTime}`}
                >
                  <span className="yt-lyric-text">{line.text}</span>
                </div>
              );
            })}
          </div>
        ) : activeTab === 'plain' && hasPlain ? (
          <div className="plain-lyrics">
            {lyricsData.plainLyrics}
          </div>
        ) : activeTab === 'about' ? (
          <div className="about-view">
            <div className="about-card">
              <h4 style={{ marginBottom: 12, fontSize: '0.92rem', color: '#818cf8' }}>
                Track Information
              </h4>
              <div className="about-row">
                <span className="about-label">Track</span>
                <span className="about-value">{lyricsData?.trackName || currentTrack?.title}</span>
              </div>
              <div className="about-row">
                <span className="about-label">Artist</span>
                <span className="about-value">{lyricsData?.artistName || currentTrack?.artist}</span>
              </div>
              <div className="about-row">
                <span className="about-label">Album</span>
                <span className="about-value">{lyricsData?.albumName || currentTrack?.album || '—'}</span>
              </div>
              <div className="about-row">
                <span className="about-label">Duration</span>
                <span className="about-value">{lyricsData?.duration ? `${lyricsData.duration}s` : '—'}</span>
              </div>
            </div>

            {currentTrack?.rawDetails && (
              <div className="about-card">
                <h4 style={{ marginBottom: 12, fontSize: '0.92rem', color: '#38bdf8' }}>
                  Release Details
                </h4>
                <div className="about-row">
                  <span className="about-label">Year</span>
                  <span className="about-value">{currentTrack.rawDetails.year || '—'}</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Label</span>
                  <span className="about-value">{currentTrack.rawDetails.label || '—'}</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Language</span>
                  <span className="about-value">{currentTrack.rawDetails.language || '—'}</span>
                </div>
                <div className="about-row">
                  <span className="about-label">Copyright</span>
                  <span className="about-value">{currentTrack.rawDetails.copyright || '—'}</span>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
