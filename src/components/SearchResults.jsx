import React from "react";
import { Play, Pause, Download, Disc, Sparkles } from "lucide-react";

const FALLBACK_ART =
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80";

function getBestImage(images) {
  if (!images) return FALLBACK_ART;
  if (typeof images === "string") return images;
  if (Array.isArray(images) && images.length > 0) {
    const highQuality =
      images.find((img) => img.quality === "500x500") ||
      images[images.length - 1];
    return highQuality?.url || FALLBACK_ART;
  }
  return FALLBACK_ART;
}

export function SearchResults({
  searchData,
  isLoading,
  currentTrack,
  isPlaying,
  onPlaySong,
  onDownloadSong,
  onSelectAlbum,
  onSelectArtist,
}) {
  if (isLoading) {
    return (
      <div className="state-container">
        <div className="spinner"></div>
        <h3>Searching music universe...</h3>
        <p style={{ marginTop: 6, fontSize: "0.88rem" }}>
          Turning into your vibe...
        </p>
      </div>
    );
  }

  if (!searchData || !searchData.data) {
    return (
      <div className="state-container">
        <Disc size={44} color="#94a3b8" style={{ marginBottom: 12 }} />
        <h3>Discover any song, artist, or album</h3>
        <p style={{ marginTop: 6, fontSize: "0.88rem", maxWidth: 460 }}>
          Search for your favorite track to stream high-fidelity audio and view
          synchronized lyrics.
        </p>
      </div>
    );
  }

  const { topQuery, songs, albums, artists } = searchData.data;
  const topResult = topQuery?.results?.[0];
  const songResults = songs?.results || [];
  const albumResults = albums?.results || [];
  const artistResults = artists?.results || [];

  return (
    <div className="search-results-section">
      {/* Top Query Hit */}
      {topResult && (
        <>
          <div className="section-title">
            <span>Top Result</span>
            <span className="section-count">Featured Hit</span>
          </div>
          <div
            className="top-result-card"
            onClick={() => onPlaySong(topResult)}
            title={`Play ${topResult.title}`}
          >
            <div className="top-thumb-wrapper">
              <img
                src={getBestImage(topResult.image)}
                alt={topResult.title}
                className="top-thumb"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = FALLBACK_ART;
                }}
              />
              <div
                className={`top-play-overlay ${
                  currentTrack?.id === topResult.id && isPlaying
                    ? "playing"
                    : ""
                }`}
              >
                <button
                  id="top-result-play-btn"
                  type="button"
                  className="top-play-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaySong(topResult);
                  }}
                  title={
                    currentTrack?.id === topResult.id && isPlaying
                      ? "Pause"
                      : "Play"
                  }
                >
                  {currentTrack?.id === topResult.id && isPlaying ? (
                    <Pause size={24} />
                  ) : (
                    <Play size={24} style={{ marginLeft: 3 }} />
                  )}
                </button>
              </div>
            </div>

            <div className="top-info">
              <div className="top-badge">
                <Sparkles size={12} />
                <span>{topResult.type || "Top Match"}</span>
              </div>
              <h2 className="top-title" title={topResult.title}>
                {topResult.title}
              </h2>
              <div
                className="top-artist"
                title={topResult.primaryArtists || topResult.singers}
              >
                {topResult.primaryArtists ||
                  topResult.singers ||
                  "Unknown Artist"}
              </div>
              <div
                className="top-desc"
                title={topResult.album || topResult.description}
              >
                {topResult.album || topResult.description || "Single Release"}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Songs List */}
      {songResults.length > 0 && (
        <>
          <div className="section-title">
            <span>Songs</span>
            <span className="section-count">{songResults.length} tracks</span>
          </div>
          <div className="songs-table">
            {songResults.map((song, index) => {
              const isCurrent = currentTrack?.id === song.id;
              const isSongPlaying = isCurrent && isPlaying;
              const thumbUrl = getBestImage(song.image);

              return (
                <div
                  key={song.id || index}
                  className={`song-row ${isCurrent ? "active" : ""}`}
                  onClick={() => onPlaySong(song)}
                >
                  <div className="song-index">
                    {isSongPlaying ? (
                      <span style={{ color: "#ffffff", fontWeight: 800 }}>
                        ▶
                      </span>
                    ) : (
                      index + 1
                    )}
                  </div>

                  <img
                    src={thumbUrl}
                    alt={song.title}
                    className="song-thumb"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = FALLBACK_ART;
                    }}
                  />

                  <div className="song-meta">
                    <div className="song-name" title={song.title}>
                      {song.title}
                    </div>
                    <div
                      className="song-artists"
                      title={song.primaryArtists || song.singers}
                    >
                      {song.primaryArtists || song.singers || song.description}
                    </div>
                  </div>

                  <div className="song-album" title={song.album}>
                    {song.album || "Single"}
                  </div>

                  <div>
                    <span className="song-format-badge">.mp4 / 320k</span>
                  </div>

                  <div
                    className="song-actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="icon-btn-subtle"
                      onClick={() => onPlaySong(song)}
                      title={isSongPlaying ? "Pause" : "Play"}
                    >
                      {isSongPlaying ? <Pause size={17} /> : <Play size={17} />}
                    </button>
                    <button
                      type="button"
                      className="icon-btn-subtle"
                      onClick={() => onDownloadSong(song)}
                      title="Download .mp4 audio stream"
                    >
                      <Download size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Albums List */}
      {albumResults.length > 0 && (
        <>
          <div className="section-title">
            <span>Albums</span>
            <span className="section-count">
              {albumResults.length} releases
            </span>
          </div>
          <div className="cards-grid">
            {albumResults.map((album) => (
              <div
                key={album.id}
                className="media-card"
                onClick={() => onSelectAlbum?.(album)}
              >
                <img
                  src={getBestImage(album.image)}
                  alt={album.title}
                  className="media-card-thumb"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ART;
                  }}
                />
                <div className="media-card-title" title={album.title}>
                  {album.title}
                </div>
                <div className="media-card-subtitle">
                  {album.artist} {album.year ? `• ${album.year}` : ""}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Artists List */}
      {artistResults.length > 0 && (
        <>
          <div className="section-title">
            <span>Artists</span>
            <span className="section-count">{artistResults.length} found</span>
          </div>
          <div className="cards-grid">
            {artistResults.map((artist) => (
              <div
                key={artist.id}
                className="media-card artist"
                onClick={() => onSelectArtist?.(artist)}
              >
                <img
                  src={getBestImage(artist.image)}
                  alt={artist.title}
                  className="media-card-thumb"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_ART;
                  }}
                />
                <div className="media-card-title" title={artist.title}>
                  {artist.title}
                </div>
                <div className="media-card-subtitle">
                  {artist.description || "Artist"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
