import * as https from "https";

export const RELEASES_API_URL =
  "https://api.github.com/repos/el-j/omni-cad/releases/latest";
export const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours
export const LAST_CHECK_KEY = "omniCAD.lastUpdateCheck";

export interface ReleaseInfo {
  tagName: string;
  htmlUrl: string;
}

export type ReleaseFetcher = () => Promise<ReleaseInfo>;

/**
 * Returns true when `latest` represents a strictly higher semver than `current`.
 * Both strings may optionally start with a "v" prefix.
 * Returns false when either string is not a valid semver triplet.
 */
export function isNewerVersion(latest: string, current: string): boolean {
  const parse = (v: string): number[] | null => {
    const parts = v.replace(/^v/, "").split(".");
    if (parts.length !== 3) {
      return null;
    }
    const nums = parts.map(Number);
    if (nums.some((n) => !Number.isFinite(n))) {
      return null;
    }
    return nums;
  };
  const l = parse(latest);
  const c = parse(current);
  if (!l || !c) {
    return false;
  }
  const [lMaj, lMin, lPatch] = l;
  const [cMaj, cMin, cPatch] = c;
  if (lMaj !== cMaj) {
    return lMaj > cMaj;
  }
  if (lMin !== cMin) {
    return lMin > cMin;
  }
  return lPatch > cPatch;
}

/** Default fetcher that calls the GitHub Releases API. */
export function defaultFetcher(): Promise<ReleaseInfo> {
  return new Promise((resolve, reject) => {
    const options = {
      headers: {
        "User-Agent": "omni-cad-vscode-extension",
        Accept: "application/vnd.github+json",
      },
    };

    https
      .get(RELEASES_API_URL, options, (res) => {
        let data = "";
        res.on("data", (chunk: string) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(data) as unknown;
            if (
              typeof json !== "object" ||
              json === null ||
              !("tag_name" in json) ||
              typeof (json as Record<string, unknown>).tag_name !== "string" ||
              !("html_url" in json) ||
              typeof (json as Record<string, unknown>).html_url !== "string"
            ) {
              reject(
                new Error("Unexpected GitHub Releases API response shape"),
              );
              return;
            }
            const { tag_name, html_url } = json as {
              tag_name: string;
              html_url: string;
            };
            resolve({ tagName: tag_name, htmlUrl: html_url });
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}
