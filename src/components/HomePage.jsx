import React from 'react';
import { CardSection } from './CardSection';
import { NoticeBanner } from './NoticeBanner';
import { SuggestedForYou } from './SuggestedForYou';
import { Footer } from './Footer';

import trendingSongs from '../data/trending.json';
import suggestedSongs from '../data/suggested_for_u.json';
import mostPlayedSongs from '../data/most_played.json';
import topHitsSongs from '../data/top_hits.json';

export function HomePage({
  currentTrack,
  isPlaying,
  onPlaySong,
  onDownloadSong,
}) {
  return (
    <div className="home-page-container">
      {/* SECTION 1: Trending (3:4 portrait cards) */}
      <CardSection
        title="Trending"
        items={trendingSongs}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlaySong={onPlaySong}
        onDownloadSong={onDownloadSong}
      />

      {/* Top Banner / Notice with subtle gold border */}
      <NoticeBanner />

      {/* SECTION 2: Suggested for You (2-column layout, compact horizontal rows) */}
      <SuggestedForYou
        songs={suggestedSongs}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlaySong={onPlaySong}
        onDownloadSong={onDownloadSong}
      />

      {/* SECTION 3: Most Played (3:4 cards) */}
      <CardSection
        title="Most Played"
        items={mostPlayedSongs}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlaySong={onPlaySong}
        onDownloadSong={onDownloadSong}
      />

      {/* SECTION 4: Top Hits (3:4 cards) */}
      <CardSection
        title="Top Hits"
        items={topHitsSongs}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onPlaySong={onPlaySong}
        onDownloadSong={onDownloadSong}
      />

      {/* SECTION 5: Copyright and Legal Footer */}
      <Footer />
    </div>
  );
}
