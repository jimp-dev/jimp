export interface WeeklyDownloads {
  downloads: number;
  start: string;
  end: string;
}

async function fetchWeeklyDownloads(): Promise<WeeklyDownloads | null> {
  try {
    const response = await fetch(
      "https://api.npmjs.org/downloads/point/last-week/jimp",
      { signal: AbortSignal.timeout(5000) }
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as Partial<WeeklyDownloads>;

    if (typeof data.downloads !== "number" || !data.start || !data.end) {
      return null;
    }

    return { downloads: data.downloads, start: data.start, end: data.end };
  } catch {
    // Offline builds just leave the badge out.
    return null;
  }
}

/**
 * Last week's npm downloads of `jimp`. Fetched once per build and shared by
 * every page, or `null` if npm couldn't be reached.
 */
export const weeklyDownloads = fetchWeeklyDownloads();

/** 4480884 → "4.5M" */
export function compactCount(n: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
}
