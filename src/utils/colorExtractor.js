/**
 * Color extraction utility to derive rich matching gradients from song artwork.
 * Uses an offscreen canvas with crossOrigin = 'anonymous'.
 */

// Cache extracted colors by image URL
const colorCache = new Map();

/**
 * Fallback palettes in case canvas sampling is blocked or image is loading
 */
const DEFAULT_PALETTES = [
  { primary: [99, 102, 241], secondary: [168, 85, 247], dark: [15, 12, 30] },
  { primary: [236, 72, 153], secondary: [139, 92, 246], dark: [28, 10, 24] },
  { primary: [6, 182, 212], secondary: [59, 130, 246], dark: [8, 20, 32] },
  { primary: [245, 158, 11], secondary: [239, 68, 68], dark: [28, 16, 10] },
  { primary: [16, 185, 129], secondary: [6, 182, 212], dark: [8, 26, 20] },
];

function getHashPalette(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % DEFAULT_PALETTES.length;
  return DEFAULT_PALETTES[index];
}

/**
 * Extract vibrant colors from an image URL
 * @param {string} imageUrl
 * @param {string} fallbackKey
 * @returns {Promise<{ primaryRgb: string, secondaryRgb: string, darkRgb: string, barGradient: string, fullGradient: string, glowRgba: string }>}
 */
export async function extractArtworkColors(imageUrl, fallbackKey = 'default') {
  if (!imageUrl) {
    return formatPalette(getHashPalette(fallbackKey));
  }

  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl);
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    const timer = setTimeout(() => {
      const fallback = formatPalette(getHashPalette(fallbackKey));
      resolve(fallback);
    }, 1800);

    img.onload = () => {
      clearTimeout(timer);
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const sampleSize = 64;
        canvas.width = sampleSize;
        canvas.height = sampleSize;

        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const imageData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

        // Sample buckets
        const colorBuckets = [];

        for (let i = 0; i < imageData.length; i += 16) {
          const r = imageData[i];
          const g = imageData[i + 1];
          const b = imageData[i + 2];
          const a = imageData[i + 3];

          if (a < 128) continue;

          // Skip near blacks and near whites
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const brightness = (max + min) / 2;
          const saturation = max === 0 ? 0 : (max - min) / max;

          if (brightness > 20 && brightness < 235 && saturation > 0.15) {
            colorBuckets.push({ r, g, b, sat: saturation, bright: brightness });
          }
        }

        if (colorBuckets.length === 0) {
          const fallback = formatPalette(getHashPalette(fallbackKey));
          colorCache.set(imageUrl, fallback);
          resolve(fallback);
          return;
        }

        // Sort by saturation and pick top distinct colors
        colorBuckets.sort((a, b) => b.sat - a.sat);

        const primary = colorBuckets[0];
        let secondary = null;

        for (let i = 1; i < colorBuckets.length; i++) {
          const c = colorBuckets[i];
          const dist = Math.sqrt(
            Math.pow(c.r - primary.r, 2) +
            Math.pow(c.g - primary.g, 2) +
            Math.pow(c.b - primary.b, 2)
          );
          if (dist > 60) {
            secondary = c;
            break;
          }
        }

        if (!secondary) {
          // Adjust hue or lightness slightly for secondary
          secondary = {
            r: Math.min(255, primary.r + 40),
            g: Math.max(0, primary.g - 30),
            b: Math.min(255, primary.b + 60),
          };
        }

        // Deep dark ambient color derived from primary
        const dark = {
          r: Math.round(primary.r * 0.12),
          g: Math.round(primary.g * 0.12),
          b: Math.round(primary.b * 0.16),
        };

        const result = formatPalette({
          primary: [primary.r, primary.g, primary.b],
          secondary: [secondary.r, secondary.g, secondary.b],
          dark: [dark.r, dark.g, dark.b],
        });

        colorCache.set(imageUrl, result);
        resolve(result);
      } catch (err) {
        const fallback = formatPalette(getHashPalette(fallbackKey));
        resolve(fallback);
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      const fallback = formatPalette(getHashPalette(fallbackKey));
      resolve(fallback);
    };

    img.src = imageUrl;
  });
}

function formatPalette({ primary, secondary, dark }) {
  const pStr = `${primary[0]}, ${primary[1]}, ${primary[2]}`;
  const sStr = `${secondary[0]}, ${secondary[1]}, ${secondary[2]}`;
  const dStr = `${dark[0]}, ${dark[1]}, ${dark[2]}`;

  return {
    primaryRgb: `rgb(${pStr})`,
    secondaryRgb: `rgb(${sStr})`,
    darkRgb: `rgb(${dStr})`,
    pStr,
    sStr,
    dStr,
    // Bar gradient: subtle glass gradient with matched ambient glow
    barGradient: `linear-gradient(90deg, rgba(${dStr}, 0.94) 0%, rgba(${pStr}, 0.22) 50%, rgba(${sStr}, 0.18) 100%)`,
    // Full screen gradient: rich mesh radial gradients
    fullGradient: `
      radial-gradient(circle at 15% 20%, rgba(${pStr}, 0.55) 0%, transparent 50%),
      radial-gradient(circle at 85% 30%, rgba(${sStr}, 0.45) 0%, transparent 45%),
      radial-gradient(circle at 50% 85%, rgba(${pStr}, 0.3) 0%, transparent 60%),
      linear-gradient(180deg, rgba(${dStr}, 0.95) 0%, #080808 100%)
    `,
    glowRgba: `rgba(${pStr}, 0.4)`,
  };
}
