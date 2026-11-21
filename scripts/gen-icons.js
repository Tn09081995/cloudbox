const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const svgIcon = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#2563eb"/>
      <stop offset="50%" stop-color="#3b82f6"/>
      <stop offset="100%" stop-color="#1d4ed8"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.25"/>
    </filter>
  </defs>
  
  <rect width="512" height="512" rx="120" fill="url(#bgGrad)"/>
  
  <g filter="url(#shadow)" fill="none" stroke="#ffffff" stroke-width="24" stroke-linecap="round" stroke-linejoin="round">
    <!-- Cloud outline -->
    <path d="M160 340 H360 C404 340 440 304 440 260 C440 220 410 186 370 181 C365 115 310 65 242 65 C185 65 137 100 120 150 C75 160 40 200 40 250 C40 300 76 340 125 340" fill="rgba(255,255,255,0.15)" />
    
    <!-- Storage Box inside -->
    <path d="M196 280 L256 240 L316 280 L256 320 Z" fill="#ffffff" stroke="#ffffff" stroke-width="8"/>
    <path d="M196 280 V350 L256 390 V320 Z" fill="rgba(255,255,255,0.85)" stroke="#ffffff" stroke-width="8"/>
    <path d="M316 280 V350 L256 390 V320 Z" fill="rgba(255,255,255,0.7)" stroke="#ffffff" stroke-width="8"/>
  </g>
</svg>
`;

async function run() {
  const publicIconsDir = path.join(__dirname, '..', 'public', 'icons');
  if (!fs.existsSync(publicIconsDir)) fs.mkdirSync(publicIconsDir, { recursive: true });

  const svgBuffer = Buffer.from(svgIcon);

  await sharp(svgBuffer).resize(192, 192).png().toFile(path.join(publicIconsDir, 'icon-192.png'));
  await sharp(svgBuffer).resize(512, 512).png().toFile(path.join(publicIconsDir, 'icon-512.png'));
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(publicIconsDir, 'apple-touch-icon.png'));

  // Android mipmaps
  const resDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'res');
  const mipmaps = [
    { dir: 'mipmap-mdpi', size: 48 },
    { dir: 'mipmap-hdpi', size: 72 },
    { dir: 'mipmap-xhdpi', size: 96 },
    { dir: 'mipmap-xxhdpi', size: 144 },
    { dir: 'mipmap-xxxhdpi', size: 192 },
  ];

  for (const m of mipmaps) {
    const targetDir = path.join(resDir, m.dir);
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    await sharp(svgBuffer).resize(m.size, m.size).png().toFile(path.join(targetDir, 'ic_launcher.png'));
    await sharp(svgBuffer).resize(m.size, m.size).png().toFile(path.join(targetDir, 'ic_launcher_round.png'));
  }

  console.log('All icons generated successfully!');
}

run().catch(console.error);
