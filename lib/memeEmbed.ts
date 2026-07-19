export type MemeKind = "instagram" | "youtube";

export function classifyMemeUrl(url: string): MemeKind | null {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "instagram.com") return "instagram";
    if (host === "youtube.com" || host === "youtu.be" || host === "m.youtube.com") return "youtube";
    return null;
  } catch {
    return null;
  }
}

export function getYoutubeEmbedUrl(url: string): string | null {
  try {
    const u = new URL(url);
    let id: string | null = null;

    if (u.hostname.replace(/^www\./, "") === "youtu.be") {
      id = u.pathname.slice(1);
    } else if (u.pathname.startsWith("/shorts/")) {
      id = u.pathname.split("/shorts/")[1]?.split("/")[0];
    } else {
      id = u.searchParams.get("v");
    }

    if (!id) return null;
    return `https://www.youtube-nocookie.com/embed/${id}`;
  } catch {
    return null;
  }
}
