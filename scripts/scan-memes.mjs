import { readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const memesDir = path.join(__dirname, "..", "public", "memes");
const outFile = path.join(__dirname, "..", "data", "memes.json");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);

let files = [];
try {
  files = readdirSync(memesDir)
    .filter((f) => IMAGE_EXT.has(path.extname(f).toLowerCase()))
    .sort()
    .map((f) => `/memes/${f}`);
} catch {
  files = [];
}

writeFileSync(outFile, JSON.stringify(files, null, 2) + "\n");
console.log(`scan-memes: found ${files.length} meme image(s)`);
