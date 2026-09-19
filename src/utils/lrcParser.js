/**
 * Utility to parse LRC synchronized lyrics into structured line items.
 * LRC format: [mm:ss.xx] Lyric text
 */

export function parseLrc(lrcText) {
  if (!lrcText || typeof lrcText !== 'string') return [];

  const lines = lrcText.split('\n');
  const parsed = [];
  // Regex to match timestamp tag: [mm:ss.xx] or [mm:ss]
  const timeRegex = /\[(\d{1,2}):(\d{2})(?:\.(\d{1,3}))?\]/g;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    timeRegex.lastIndex = 0;
    const match = timeRegex.exec(trimmed);

    if (match) {
      const minutes = parseInt(match[1], 10);
      const seconds = parseInt(match[2], 10);
      const fraction = match[3] ? parseFloat(`0.${match[3]}`) : 0;
      const totalSeconds = minutes * 60 + seconds + fraction;

      const text = trimmed.replace(timeRegex, '').trim();

      parsed.push({
        time: totalSeconds,
        formattedTime: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
        text: text || '♪',
      });
    }
  }

  // Sort chronologically
  return parsed.sort((a, b) => a.time - b.time);
}

/**
 * Finds the currently active lyric index for a given playback timestamp.
 */
export function getActiveLyricIndex(lyrics, currentTime) {
  if (!lyrics || lyrics.length === 0) return -1;

  let activeIndex = -1;
  for (let i = 0; i < lyrics.length; i++) {
    if (currentTime >= lyrics[i].time) {
      activeIndex = i;
    } else {
      break;
    }
  }

  return activeIndex;
}

/**
 * Format duration in seconds to mm:ss
 */
export function formatTime(seconds) {
  if (isNaN(seconds) || seconds == null || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}
