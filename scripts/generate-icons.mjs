import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const source = path.join(root, "public", "icons", "icon-source.svg");

const targets = [
  { out: path.join(root, "public", "icons", "icon-192.png"), size: 192 },
  { out: path.join(root, "public", "icons", "icon-512.png"), size: 512 },
  { out: path.join(root, "public", "icons", "icon-maskable-512.png"), size: 512 },
  { out: path.join(root, "app", "apple-icon.png"), size: 180 },
  { out: path.join(root, "app", "icon.png"), size: 48 },
];

for (const t of targets) {
  await sharp(source, { density: 384 }).resize(t.size, t.size).png().toFile(t.out);
  console.log(`generated ${t.out}`);
}
