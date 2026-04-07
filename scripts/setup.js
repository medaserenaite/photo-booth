#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const dirs = ['server/uploads', 'server/data', 'frames', 'client/public/frames'];
for (const dir of dirs) {
  const full = path.join(ROOT, dir);
  if (!fs.existsSync(full)) { fs.mkdirSync(full, { recursive: true }); console.log(`Created: ${dir}`); }
}

const framesDir       = path.join(ROOT, 'frames');
const clientFramesDir = path.join(ROOT, 'client/public/frames');

// ── Dimensions & helpers ──────────────────────────────────────────────────────
const W = 1280, H = 720, B = 64;
const cx = W / 2, cy = H / 2, hB = B / 2;  // center & half-border

// evenodd donut path: opaque border, transparent center.
// botB lets polaroid have a taller bottom border.
const fp = (botB = B) =>
  `M 0,0 H ${W} V ${H} H 0 Z M ${B},${B} H ${W - B} V ${H - botB} H ${B} Z`;

// ── Frame definitions ─────────────────────────────────────────────────────────
const frameDefs = [

  // ── 1. Gold Trim ─────────────────────────────────────────────────────────
  {
    name: 'gold-party.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#F9E872"/>
      <stop offset="20%"  stop-color="#E8B700"/>
      <stop offset="50%"  stop-color="#C8860A"/>
      <stop offset="80%"  stop-color="#E8B700"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
    <linearGradient id="goldSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="50%"  stop-color="#ffffff" stop-opacity="0.04"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.12"/>
    </linearGradient>
  </defs>

  <!-- Main gradient border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#gold)"/>
  <!-- Sheen overlay -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#goldSheen)"/>

  <!-- Outer edge line -->
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none"
    stroke="#F9E872" stroke-width="3" opacity="0.7"/>
  <!-- Inner edge lines -->
  <rect x="${B - 8}" y="${B - 8}" width="${W - B * 2 + 16}" height="${H - B * 2 + 16}" fill="none"
    stroke="#8B6914" stroke-width="3" opacity="0.9"/>
  <rect x="${B - 4}" y="${B - 4}" width="${W - B * 2 + 8}" height="${H - B * 2 + 8}" fill="none"
    stroke="#F9E872" stroke-width="1.5" opacity="0.85"/>

  <!-- Corner nested diamonds -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) => {
    const r1 = hB - 4, r2 = hB - 13;
    return `
    <polygon points="${px},${py - r1} ${px + r1},${py} ${px},${py + r1} ${px - r1},${py}"
      fill="#F9E872" opacity="0.95"/>
    <polygon points="${px},${py - r2} ${px + r2},${py} ${px},${py + r2} ${px - r2},${py}"
      fill="#C8860A"/>
    <circle cx="${px}" cy="${py}" r="4.5" fill="#F9E872"/>`;
  }).join('')}

  <!-- Mid-side accent diamonds -->
  ${[[hB, cy], [W - hB, cy], [cx, hB], [cx, H - hB]].map(([px, py]) => `
    <polygon points="${px},${py - 12} ${px + 12},${py} ${px},${py + 12} ${px - 12},${py}"
      fill="#F9E872" opacity="0.9"/>
    <polygon points="${px},${py - 6}  ${px + 6},${py}  ${px},${py + 6}  ${px - 6},${py}"
      fill="#C8860A"/>
  `).join('')}
</svg>`,
  },

  // ── 2. Cursed Glow ───────────────────────────────────────────────────────
  {
    name: 'neon-glow.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="g8">
      <feGaussianBlur stdDeviation="8" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="g4">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="g2">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Very dark border -->
  <path fill-rule="evenodd" d="${fp()}" fill="#090614"/>

  <!-- Outer glow ring -->
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none"
    stroke="#6B1FA8" stroke-width="6" filter="url(#g8)" opacity="0.9"/>
  <!-- Mid glow ring -->
  <rect x="${B - 12}" y="${B - 12}" width="${W - B * 2 + 24}" height="${H - B * 2 + 24}" fill="none"
    stroke="#9D44D8" stroke-width="3" filter="url(#g4)" opacity="0.9"/>
  <!-- Inner glow ring -->
  <rect x="${B - 6}" y="${B - 6}" width="${W - B * 2 + 12}" height="${H - B * 2 + 12}" fill="none"
    stroke="#E040FB" stroke-width="2.5" filter="url(#g4)" opacity="0.85"/>
  <!-- Crisp inner edge -->
  <rect x="${B - 2}" y="${B - 2}" width="${W - B * 2 + 4}" height="${H - B * 2 + 4}" fill="none"
    stroke="#F3A6FF" stroke-width="1" opacity="0.9"/>

  <!-- Corner L-brackets with glow dot -->
  ${[
    [7, 7, 1, 1], [W - 7, 7, -1, 1], [7, H - 7, 1, -1], [W - 7, H - 7, -1, -1],
  ].map(([px, py, sx, sy]) => `
    <line x1="${px}" y1="${py}" x2="${px + sx * 38}" y2="${py}"
      stroke="#E040FB" stroke-width="5" stroke-linecap="round" filter="url(#g4)"/>
    <line x1="${px}" y1="${py}" x2="${px}" y2="${py + sy * 38}"
      stroke="#E040FB" stroke-width="5" stroke-linecap="round" filter="url(#g4)"/>
    <circle cx="${px}" cy="${py}" r="6" fill="#F3A6FF" filter="url(#g8)"/>
  `).join('')}

  <!-- Dot accents along top/bottom border mid-lines -->
  ${Array.from({ length: 18 }, (_, i) => {
    const x = Math.round(B + 40 + i * (W - B * 2 - 80) / 17);
    return `
    <circle cx="${x}" cy="${hB}" r="2.5" fill="#7B2FBE" opacity="0.7"/>
    <circle cx="${x}" cy="${H - hB}" r="2.5" fill="#7B2FBE" opacity="0.7"/>`;
  }).join('')}
</svg>`,
  },

  // ── 3. Wanted Poster ─────────────────────────────────────────────────────
  {
    name: 'classic-polaroid.png',
    svg: () => {
      const botB = B + 50;
      return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="parch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#f5ead0"/>
      <stop offset="100%" stop-color="#e4d0a0"/>
    </linearGradient>
    <linearGradient id="parchBot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#ede0bc"/>
      <stop offset="100%" stop-color="#d8c890"/>
    </linearGradient>
  </defs>

  <!-- Parchment border (transparent photo area) -->
  <path fill-rule="evenodd" d="${fp(botB)}" fill="url(#parch)"/>
  <!-- Bottom caption strip (slightly different tone) -->
  <rect x="0" y="${H - botB}" width="${W}" height="${botB - B}" fill="url(#parchBot)" opacity="0.6"/>

  <!-- Aged edge vignette -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="none"
    stroke="#9a7840" stroke-width="24" opacity="0.2"/>
  <!-- Inner photo border lines -->
  <rect x="${B - 7}" y="${B - 7}" width="${W - B * 2 + 14}" height="${H - botB + 7 + B - 7}" fill="none"
    stroke="#a08040" stroke-width="2" opacity="0.6"/>
  <rect x="${B - 3}" y="${B - 3}" width="${W - B * 2 + 6}" height="${H - botB + 3 + B - 3}" fill="none"
    stroke="#c8a050" stroke-width="1" opacity="0.5"/>
  <!-- Caption strip separator -->
  <line x1="${B}" y1="${H - botB}" x2="${W - B}" y2="${H - botB}"
    stroke="#9a7840" stroke-width="2" opacity="0.5"/>

  <!-- Corner pin holes (nested circles for 3D look) -->
  ${[[18, 18], [W - 18, 18], [18, H - 18], [W - 18, H - 18]].map(([px, py]) => `
    <circle cx="${px}" cy="${py}" r="9"  fill="#c4a050" opacity="0.35"/>
    <circle cx="${px}" cy="${py}" r="6"  fill="#8B6020" opacity="0.55"/>
    <circle cx="${px}" cy="${py}" r="3"  fill="#3a2800" opacity="0.7"/>
  `).join('')}

  <!-- Aged stain patches -->
  <ellipse cx="110" cy="38"     rx="90"  ry="18" fill="#b89040" opacity="0.07"/>
  <ellipse cx="${W - 180}" cy="${H - 24}" rx="110" ry="16" fill="#9a7030" opacity="0.09"/>
  <ellipse cx="${W / 2}" cy="28" rx="60"  ry="12" fill="#c8a050" opacity="0.05"/>

  <!-- ── Bottom caption strip content ── -->
  <!-- Thin accent rule at top of caption area -->
  <line x1="${B + 30}" y1="${H - botB + 11}" x2="${W - B - 30}" y2="${H - botB + 11}"
    stroke="#8b6020" stroke-width="1.5" opacity="0.55"/>

  <!-- WANTED -->
  <text x="${cx}" y="${H - botB + 58}"
    font-family="Georgia,serif" font-size="46" font-weight="bold"
    fill="#2a1200" text-anchor="middle" letter-spacing="14" opacity="0.92">WANTED</text>

  <!-- Thin rule under WANTED -->
  <line x1="${cx - 180}" y1="${H - botB + 67}" x2="${cx + 180}" y2="${H - botB + 67}"
    stroke="#8b6020" stroke-width="1" opacity="0.45"/>

  <!-- DEAD OR ALIVE -->
  <text x="${cx}" y="${H - botB + 86}"
    font-family="Georgia,serif" font-size="15" font-style="italic"
    fill="#5c3a10" text-anchor="middle" letter-spacing="5" opacity="0.85">DEAD OR ALIVE</text>

  <!-- Reward line with stars -->
  <text x="${cx}" y="${H - botB + 106}"
    font-family="Georgia,serif" font-size="13"
    fill="#7a4a18" text-anchor="middle" letter-spacing="3" opacity="0.8">★  $500 REWARD  ★</text>

  <!-- Bottom accent rule -->
  <line x1="${B + 30}" y1="${H - botB + 112}" x2="${W - B - 30}" y2="${H - botB + 112}"
    stroke="#8b6020" stroke-width="1.5" opacity="0.55"/>
</svg>`;
    },
  },

  // ── 4. Jolly Roger ───────────────────────────────────────────────────────
  {
    name: 'jolly-roger.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="ebony" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#1c1408"/>
      <stop offset="50%"  stop-color="#0e0a04"/>
      <stop offset="100%" stop-color="#1a1206"/>
    </linearGradient>
    <filter id="boneGlow">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Dark ebony border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#ebony)"/>

  <!-- Subtle wood grain lines -->
  ${[10, 20, 30, 42, 52].map(y => `
    <line x1="0" y1="${y}"     x2="${W}" y2="${y}"     stroke="#2a1c08" stroke-width="1" opacity="0.45"/>
    <line x1="0" y1="${H - y}" x2="${W}" y2="${H - y}" stroke="#2a1c08" stroke-width="1" opacity="0.45"/>
  `).join('')}

  <!-- Bone-white dashed inner border -->
  <rect x="${B - 7}" y="${B - 7}" width="${W - B * 2 + 14}" height="${H - B * 2 + 14}" fill="none"
    stroke="#d4c89a" stroke-width="3" stroke-dasharray="14,7" opacity="0.85" filter="url(#boneGlow)"/>
  <rect x="${B - 2}" y="${B - 2}" width="${W - B * 2 + 4}" height="${H - B * 2 + 4}" fill="none"
    stroke="#c0b070" stroke-width="1" opacity="0.5"/>

  <!-- Corner crossbones -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) => {
    const r = hB - 11, cap = 7;
    return `
    <line x1="${px - r}" y1="${py - r}" x2="${px + r}" y2="${py + r}"
      stroke="#d4c89a" stroke-width="9" stroke-linecap="round" filter="url(#boneGlow)"/>
    <line x1="${px + r}" y1="${py - r}" x2="${px - r}" y2="${py + r}"
      stroke="#d4c89a" stroke-width="9" stroke-linecap="round" filter="url(#boneGlow)"/>
    <circle cx="${px - r}" cy="${py - r}" r="${cap}" fill="#d4c89a"/>
    <circle cx="${px + r}" cy="${py + r}" r="${cap}" fill="#d4c89a"/>
    <circle cx="${px + r}" cy="${py - r}" r="${cap}" fill="#d4c89a"/>
    <circle cx="${px - r}" cy="${py + r}" r="${cap}" fill="#d4c89a"/>`;
  }).join('')}

  <!-- Skull in top-center of border -->
  <!-- Cranium -->
  <ellipse cx="${cx}" cy="${hB - 5}" rx="23" ry="21" fill="#d4c89a" filter="url(#boneGlow)"/>
  <!-- Jaw -->
  <rect x="${cx - 16}" y="${hB + 12}" width="32" height="15" rx="5" fill="#d4c89a"/>
  <!-- Eye sockets -->
  <ellipse cx="${cx - 9}" cy="${hB - 8}" rx="7.5" ry="8.5" fill="#0e0a04"/>
  <ellipse cx="${cx + 9}" cy="${hB - 8}" rx="7.5" ry="8.5" fill="#0e0a04"/>
  <!-- Nose -->
  <path d="M ${cx - 4},${hB + 6} L ${cx + 4},${hB + 6} L ${cx},${hB + 11} Z" fill="#0e0a04"/>
  <!-- Teeth gaps -->
  <rect x="${cx - 15}" y="${hB + 14}" width="7"  height="9" rx="1.5" fill="#0e0a04"/>
  <rect x="${cx - 5}"  y="${hB + 14}" width="7"  height="9" rx="1.5" fill="#0e0a04"/>
  <rect x="${cx + 5}"  y="${hB + 14}" width="7"  height="9" rx="1.5" fill="#0e0a04"/>

  <!-- Mid-side bone accents (small horizontal bone shapes) -->
  ${[[hB, cy], [W - hB, cy]].map(([px, py]) => `
    <line x1="${px - 18}" y1="${py}" x2="${px + 18}" y2="${py}"
      stroke="#d4c89a" stroke-width="7" stroke-linecap="round" opacity="0.8"/>
    <circle cx="${px - 18}" cy="${py}" r="5.5" fill="#d4c89a" opacity="0.85"/>
    <circle cx="${px + 18}" cy="${py}" r="5.5" fill="#d4c89a" opacity="0.85"/>
  `).join('')}
</svg>`,
  },

  // ── 5. Rum & Riches ──────────────────────────────────────────────────────
  {
    name: 'rum-barrel.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="mahog" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#4e1e02"/>
      <stop offset="40%"  stop-color="#3a1400"/>
      <stop offset="100%" stop-color="#2a0c00"/>
    </linearGradient>
    <linearGradient id="mahogV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#6a2e08" stop-opacity="0.4"/>
      <stop offset="50%"  stop-color="#3a1400" stop-opacity="0"/>
      <stop offset="100%" stop-color="#6a2e08" stop-opacity="0.4"/>
    </linearGradient>
    <linearGradient id="copper" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#d4803a"/>
      <stop offset="40%"  stop-color="#a85c20"/>
      <stop offset="60%"  stop-color="#c87030"/>
      <stop offset="100%" stop-color="#e09040"/>
    </linearGradient>
    <linearGradient id="copperV" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#d4803a"/>
      <stop offset="40%"  stop-color="#a85c20"/>
      <stop offset="60%"  stop-color="#c87030"/>
      <stop offset="100%" stop-color="#d4803a"/>
    </linearGradient>
  </defs>

  <!-- Mahogany border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#mahog)"/>
  <!-- Vertical light gradient overlay for depth -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#mahogV)"/>

  <!-- Barrel stave lines — left side border (x = 0..B) -->
  ${[9, 20, 31, 43, 54].map(x => `
    <line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#200a00" stroke-width="2"   opacity="0.55"/>
    <line x1="${x + 1}" y1="0" x2="${x + 1}" y2="${H}" stroke="#7a3e14" stroke-width="0.8" opacity="0.35"/>
  `).join('')}
  <!-- Barrel stave lines — right side border (x = W-B..W) -->
  ${[9, 20, 31, 43, 54].map(x => `
    <line x1="${W - x}" y1="0" x2="${W - x}" y2="${H}" stroke="#200a00" stroke-width="2"   opacity="0.55"/>
    <line x1="${W - x - 1}" y1="0" x2="${W - x - 1}" y2="${H}" stroke="#7a3e14" stroke-width="0.8" opacity="0.35"/>
  `).join('')}

  <!-- Copper hoop bands — top border -->
  <rect x="0" y="8"  width="${W}" height="11" fill="url(#copper)" opacity="0.92"/>
  <rect x="0" y="41" width="${W}" height="11" fill="url(#copper)" opacity="0.88"/>
  <!-- Copper hoop bands — bottom border -->
  <rect x="0" y="${H - 19}" width="${W}" height="11" fill="url(#copper)" opacity="0.92"/>
  <rect x="0" y="${H - 52}" width="${W}" height="11" fill="url(#copper)" opacity="0.88"/>
  <!-- Copper hoop bands — left/right vertical (thin accent) -->
  <rect x="0"     y="${B}" width="11" height="${H - B * 2}" fill="url(#copperV)" opacity="0.7"/>
  <rect x="${W - 11}" y="${B}" width="11" height="${H - B * 2}" fill="url(#copperV)" opacity="0.7"/>

  <!-- Inner border detail -->
  <rect x="${B - 6}" y="${B - 6}" width="${W - B * 2 + 12}" height="${H - B * 2 + 12}" fill="none"
    stroke="#c87030" stroke-width="3" opacity="0.75"/>
  <rect x="${B - 2}" y="${B - 2}" width="${W - B * 2 + 4}" height="${H - B * 2 + 4}" fill="none"
    stroke="#8b4010" stroke-width="1.2" opacity="0.6"/>

  <!-- Corner medallions (concentric copper rings) -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) => `
    <circle cx="${px}" cy="${py}" r="${hB - 5}"  fill="url(#copper)" opacity="0.9"/>
    <circle cx="${px}" cy="${py}" r="${hB - 14}" fill="#3a1400"/>
    <circle cx="${px}" cy="${py}" r="${hB - 20}" fill="url(#copper)" opacity="0.65"/>
    <circle cx="${px}" cy="${py}" r="${hB - 26}" fill="#2a0c00"/>
    <circle cx="${px}" cy="${py}" r="6"          fill="#e09040"/>
    <circle cx="${px}" cy="${py}" r="3"          fill="#c87030"/>
  `).join('')}

  <!-- Outer edge highlight -->
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="none"
    stroke="#d4803a" stroke-width="2.5" opacity="0.45"/>
</svg>`,
  },

  // ── 6. Sea Voyage ────────────────────────────────────────────────────────
  {
    name: 'sea-voyage.png',
    svg: () => {
      // Pre-compute wave paths (stay in top/bottom border zones)
      const waveSegments = 22;
      const waveW = W - B * 2;
      const segW  = waveW / waveSegments;

      const buildWave = (baseY, amp) => {
        const pts = [`M ${B},${baseY}`];
        for (let i = 0; i < waveSegments; i++) {
          const x1 = B + i * segW;
          const dir = i % 2 === 0 ? -1 : 1;
          pts.push(`Q ${x1 + segW / 2},${baseY + dir * amp} ${x1 + segW},${baseY}`);
        }
        return pts.join(' ');
      };

      const topWave1 = buildWave(hB - 6, 9);
      const topWave2 = buildWave(hB + 4, 7);
      const botWave1 = buildWave(H - hB - 4, 9);
      const botWave2 = buildWave(H - hB + 6, 7);

      return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="navy" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0c2040"/>
      <stop offset="50%"  stop-color="#081628"/>
      <stop offset="100%" stop-color="#041018"/>
    </linearGradient>
    <linearGradient id="teal" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#0d7a90"/>
      <stop offset="50%"  stop-color="#12a0c0"/>
      <stop offset="100%" stop-color="#0d7a90"/>
    </linearGradient>
    <filter id="seaGlow">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="seaGlow2">
      <feGaussianBlur stdDeviation="2" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Deep navy border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#navy)"/>

  <!-- Outer rope/chain border (thick dashed) -->
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none"
    stroke="#1a5a70" stroke-width="8" stroke-dasharray="22,9" stroke-linecap="round" opacity="0.7"/>
  <rect x="5" y="5" width="${W - 10}" height="${H - 10}" fill="none"
    stroke="#0d7a90" stroke-width="3" stroke-dasharray="22,9" stroke-linecap="round"
    stroke-dashoffset="15" opacity="0.5"/>

  <!-- Glowing inner border -->
  <rect x="${B - 9}" y="${B - 9}" width="${W - B * 2 + 18}" height="${H - B * 2 + 18}" fill="none"
    stroke="#0d7a90" stroke-width="4" filter="url(#seaGlow)" opacity="0.9"/>
  <rect x="${B - 4}" y="${B - 4}" width="${W - B * 2 + 8}" height="${H - B * 2 + 8}" fill="none"
    stroke="#20c0d8" stroke-width="2" filter="url(#seaGlow2)" opacity="0.85"/>
  <rect x="${B - 1}" y="${B - 1}" width="${W - B * 2 + 2}" height="${H - B * 2 + 2}" fill="none"
    stroke="#60e0f0" stroke-width="1" opacity="0.6"/>

  <!-- Wave accents in top/bottom border strips -->
  <path d="${topWave1}" fill="none" stroke="#0d7a90" stroke-width="2.5" opacity="0.7"/>
  <path d="${topWave2}" fill="none" stroke="#20c0d8" stroke-width="1.5" opacity="0.5"/>
  <path d="${botWave1}" fill="none" stroke="#0d7a90" stroke-width="2.5" opacity="0.7"/>
  <path d="${botWave2}" fill="none" stroke="#20c0d8" stroke-width="1.5" opacity="0.5"/>

  <!-- Corner anchors -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([ax, ay]) => {
    const shank = 22, ring = 8, stock = 18, fluke = 8;
    const ry  = ay - shank / 2 - ring;   // ring center y
    const ty  = ay - shank / 2;          // top of shank
    const by  = ay + shank / 2;          // bottom of shank
    const sty = ty + 3;                  // stock y
    return `
    <!-- Ring -->
    <circle cx="${ax}" cy="${ry}" r="${ring}" fill="none"
      stroke="#20c0d8" stroke-width="3.5" filter="url(#seaGlow2)"/>
    <!-- Shank -->
    <line x1="${ax}" y1="${ty}" x2="${ax}" y2="${by}"
      stroke="#20c0d8" stroke-width="4" stroke-linecap="round"/>
    <!-- Stock -->
    <line x1="${ax - stock}" y1="${sty}" x2="${ax + stock}" y2="${sty}"
      stroke="#20c0d8" stroke-width="3" stroke-linecap="round"/>
    <!-- Flukes -->
    <path d="M ${ax - 14},${by - fluke} Q ${ax - 20},${by + 6} ${ax - 10},${by + 9}
             L ${ax},${by} L ${ax + 10},${by + 9} Q ${ax + 20},${by + 6} ${ax + 14},${by - fluke}"
      fill="none" stroke="#20c0d8" stroke-width="3"
      stroke-linecap="round" stroke-linejoin="round" filter="url(#seaGlow2)"/>
    <!-- Anchor dot -->
    <circle cx="${ax}" cy="${ay}" r="3" fill="#60e0f0"/>`;
  }).join('')}

  <!-- Mid-side compass-star accents -->
  ${[[hB, cy], [W - hB, cy]].map(([px, py]) => `
    <line x1="${px - 16}" y1="${py}" x2="${px + 16}" y2="${py}"
      stroke="#20c0d8" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
    <line x1="${px}" y1="${py - 16}" x2="${px}" y2="${py + 16}"
      stroke="#20c0d8" stroke-width="3" stroke-linecap="round" opacity="0.9"/>
    <line x1="${px - 11}" y1="${py - 11}" x2="${px + 11}" y2="${py + 11}"
      stroke="#0d7a90" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <line x1="${px + 11}" y1="${py - 11}" x2="${px - 11}" y2="${py + 11}"
      stroke="#0d7a90" stroke-width="2" stroke-linecap="round" opacity="0.7"/>
    <circle cx="${px}" cy="${py}" r="4.5" fill="#20c0d8"/>
    <circle cx="${px}" cy="${py}" r="2"   fill="#081628"/>
  `).join('')}
</svg>`;
    },
  },
];

// ── Generate & copy ───────────────────────────────────────────────────────────
async function generateFrames() {
  try {
    const { default: sharp } = await import('sharp');

    for (const frame of frameDefs) {
      const outPath = path.join(framesDir, frame.name);
      const svg = frame.svg();

      await sharp({
        create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
      })
        .composite([{ input: Buffer.from(svg), blend: 'over' }])
        .png()
        .toFile(outPath);

      console.log(`Generated: ${frame.name}`);
    }
  } catch (err) {
    console.warn('Sharp not available — skipping frame generation.', err.message);
    return;
  }

  for (const frame of frameDefs) {
    const src  = path.join(framesDir, frame.name);
    const dest = path.join(clientFramesDir, frame.name);
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest);
      console.log(`Copied:    frames/${frame.name} → client/public/frames/${frame.name}`);
    }
  }
}

generateFrames().then(() => {
  console.log('\nSetup complete! Next steps:');
  console.log('  1. Edit .env with your Twilio credentials + BOOTH_PASSWORD');
  console.log('  2. npm run dev\n');
});
