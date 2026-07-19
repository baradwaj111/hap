import type { Quote } from "./content";

export async function saveQuoteAsImage(quote: Quote) {
  const rootStyle = getComputedStyle(document.documentElement);
  const bg = rootStyle.getPropertyValue("--bg").trim() || "#fdf8ff";
  const accent = rootStyle.getPropertyValue("--accent-2").trim() || "#f6cfe0";
  const ink = rootStyle.getPropertyValue("--ink").trim() || "#4a4458";
  const muted = rootStyle.getPropertyValue("--muted").trim() || "#8b84a0";
  const displayFont = rootStyle.getPropertyValue("--font-display").trim() || "sans-serif";

  const card = document.createElement("div");
  card.style.cssText = `
    position: fixed; left: -9999px; top: 0;
    width: 640px; padding: 64px 56px;
    background: linear-gradient(160deg, ${bg} 0%, ${accent} 100%);
    display: flex; flex-direction: column; justify-content: center; gap: 24px;
    box-sizing: border-box; min-height: 640px;
  `;

  const text = document.createElement("p");
  text.textContent = `“${quote.text}”`;
  text.style.cssText = `
    font-family: ${displayFont}; font-size: 34px; line-height: 1.4;
    color: ${ink}; margin: 0;
  `;
  card.appendChild(text);

  if (quote.author) {
    const author = document.createElement("p");
    author.textContent = `— ${quote.author}`;
    author.style.cssText = `font-size: 18px; color: ${muted}; margin: 0;`;
    card.appendChild(author);
  }

  const brand = document.createElement("p");
  brand.textContent = "Hap 🐥";
  brand.style.cssText = `font-size: 16px; color: ${muted}; margin-top: 24px;`;
  card.appendChild(brand);

  document.body.appendChild(card);

  try {
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(card, { scale: 2, backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "hap-quote.png";
    link.click();
  } finally {
    document.body.removeChild(card);
  }
}
