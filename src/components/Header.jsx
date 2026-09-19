import React, { useState } from 'react';
import { Search, X, Music, FileText } from 'lucide-react';

export function Header({
  query,
  setQuery,
  onSearch,
  showLyrics,
  setShowLyrics,
  hasTrack,
  onHomeClick,
}) {
  const [localInput, setLocalInput] = useState(query);

  React.useEffect(() => {
    setLocalInput(query || '');
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (localInput.trim()) {
      setQuery(localInput.trim());
      onSearch(localInput.trim());
    }
  };

  const handleClear = () => {
    setLocalInput('');
    setQuery('');
    onHomeClick?.();
  };

  const handleBrandClick = () => {
    setLocalInput('');
    setQuery('');
    onHomeClick?.();
  };

  return (
    <header className="header">
      <div className="brand" onClick={handleBrandClick} title="Go to Home">
        <div className="brand-icon">
          <Music size={22} />
        </div>
        <div className="brand-text">
          <h1>Sonix</h1>
          <span>Song Player</span>
        </div>
      </div>

      <div className="search-container">
        <form onSubmit={handleSubmit} className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            id="main-search-input"
            type="text"
            className="search-input"
            placeholder="Search songs, artists, albums (e.g. 'Love Me Not')..."
            value={localInput}
            onChange={(e) => setLocalInput(e.target.value)}
          />
          {localInput && (
            <button
              id="clear-search-btn"
              type="button"
              className="search-clear"
              onClick={handleClear}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </form>
      </div>

      <div className="header-actions">
        {/* {hasTrack && (
          <button
            id="toggle-lyrics-header-btn"
            type="button"
            className={`action-btn ${showLyrics ? 'active' : ''}`}
            onClick={() => setShowLyrics(!showLyrics)}
            title="Toggle Synced Lyrics"
          >
            <FileText size={16} />
            <span>Lyrics</span>
          </button>
        )} */}
      </div>
    </header>
  );
}
