// Run with: node generate-icons.js
// Requires: npm install canvas  (only for icon generation, not bundled)
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];

for (const size of sizes) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background circle
  ctx.fillStyle = '#7c3aed';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
  ctx.fill();

  // Bookmark shape
  const pad = size * 0.2;
  const w = size - pad * 2;
  const h = size - pad * 1.5;
  const notchY = h * 0.65;
  const notchDepth = h * 0.18;

  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(pad, pad * 0.75);
  ctx.lineTo(pad + w, pad * 0.75);
  ctx.lineTo(pad + w, pad * 0.75 + h);
  ctx.lineTo(pad + w / 2, pad * 0.75 + notchY);
  ctx.lineTo(pad, pad * 0.75 + h);
  ctx.closePath();
  ctx.fill();

  const outPath = path.join(__dirname, 'icons', `icon${size}.png`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, canvas.toBuffer('image/png'));
  console.log(`Generated ${outPath}`);
}
