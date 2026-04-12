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

  // ── 7. Ship's Wheel ──────────────────────────────────────────────────────
  {
    name: 'ships-wheel.png',
    svg: () => {
      // Render a ship's wheel: spokes + rim + hub at (px,py)
      const wheel = (px, py, rimR, hubR, nSpokes, color, strokeW = 2.5) => {
        const spokes = Array.from({ length: nSpokes }, (_, i) => {
          const a = (i * Math.PI * 2) / nSpokes;
          const x1 = (px + hubR * Math.cos(a)).toFixed(2);
          const y1 = (py + hubR * Math.sin(a)).toFixed(2);
          const x2 = (px + rimR * Math.cos(a)).toFixed(2);
          const y2 = (py + rimR * Math.sin(a)).toFixed(2);
          return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
            stroke="${color}" stroke-width="${strokeW}" stroke-linecap="round"/>`;
        }).join('');
        return `
        ${spokes}
        <circle cx="${px}" cy="${py}" r="${rimR}" fill="none" stroke="${color}" stroke-width="${strokeW + 1.5}"/>
        <circle cx="${px}" cy="${py}" r="${hubR}" fill="none" stroke="${color}" stroke-width="${strokeW}"/>
        <circle cx="${px}" cy="${py}" r="${(hubR * 0.45).toFixed(1)}" fill="${color}"/>`;
      };

      return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="walnut" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#2e1a08"/>
      <stop offset="40%"  stop-color="#1a0e04"/>
      <stop offset="100%" stop-color="#261406"/>
    </linearGradient>
    <linearGradient id="walnutH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#6a3a14" stop-opacity="0.25"/>
      <stop offset="50%"  stop-color="#1a0e04" stop-opacity="0"/>
      <stop offset="100%" stop-color="#6a3a14" stop-opacity="0.25"/>
    </linearGradient>
    <filter id="brassGlow">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Walnut wood border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#walnut)"/>
  <path fill-rule="evenodd" d="${fp()}" fill="url(#walnutH)"/>

  <!-- Wood grain lines (horizontal) -->
  ${[7, 15, 24, 35, 46, 56].map(y => `
  <line x1="0" y1="${y}"     x2="${W}" y2="${y}"     stroke="#110800" stroke-width="1" opacity="0.38"/>
  <line x1="0" y1="${H - y}" x2="${W}" y2="${H - y}" stroke="#110800" stroke-width="1" opacity="0.38"/>
  `).join('')}

  <!-- Outer rope border -->
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none"
    stroke="#7a5020" stroke-width="8" stroke-dasharray="20,9" stroke-linecap="round" opacity="0.7"/>
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none"
    stroke="#c09050" stroke-width="3" stroke-dasharray="20,9" stroke-dashoffset="14"
    stroke-linecap="round" opacity="0.5"/>

  <!-- Brass inner border -->
  <rect x="${B - 8}" y="${B - 8}" width="${W - B * 2 + 16}" height="${H - B * 2 + 16}" fill="none"
    stroke="#b8870a" stroke-width="3.5" filter="url(#brassGlow)" opacity="0.85"/>
  <rect x="${B - 3}" y="${B - 3}" width="${W - B * 2 + 6}" height="${H - B * 2 + 6}" fill="none"
    stroke="#e8c050" stroke-width="1.5" opacity="0.8"/>

  <!-- Corner wheels (8 spokes each) -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) =>
    wheel(px, py, hB - 8, hB - 20, 8, '#c8a030')
  ).join('')}

  <!-- Top-center accent wheel (slightly larger) -->
  ${wheel(cx, hB, hB - 7, hB - 19, 8, '#c8a030', 2.5)}

  <!-- Mid-side compass circles -->
  ${[[hB, cy], [W - hB, cy]].map(([px, py]) => `
  <circle cx="${px}" cy="${py}" r="${hB - 16}" fill="none" stroke="#b8870a" stroke-width="3.5" opacity="0.75"/>
  <circle cx="${px}" cy="${py}" r="${hB - 24}" fill="none" stroke="#e8c050" stroke-width="1" opacity="0.6"/>
  <circle cx="${px}" cy="${py}" r="5" fill="#c8a030" opacity="0.9"/>
  `).join('')}
</svg>`;
    },
  },

  // ── 8. Tavern Sign ───────────────────────────────────────────────────────
  {
    name: 'tavern-sign.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="oak" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#4a2800"/>
      <stop offset="40%"  stop-color="#321800"/>
      <stop offset="100%" stop-color="#3e2004"/>
    </linearGradient>
    <linearGradient id="oakH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#8a5020" stop-opacity="0.3"/>
      <stop offset="50%"  stop-color="#321800" stop-opacity="0"/>
      <stop offset="100%" stop-color="#8a5020" stop-opacity="0.3"/>
    </linearGradient>
    <linearGradient id="candleGlow" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#e08010"/>
      <stop offset="50%"  stop-color="#f0a020"/>
      <stop offset="100%" stop-color="#e08010"/>
    </linearGradient>
    <filter id="warmGlow">
      <feGaussianBlur stdDeviation="5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="ironShadow">
      <feGaussianBlur stdDeviation="1.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Dark oak border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#oak)"/>
  <path fill-rule="evenodd" d="${fp()}" fill="url(#oakH)"/>

  <!-- Wood plank grain (horizontal) -->
  ${[6, 13, 21, 30, 40, 50, 58].map(y => `
  <line x1="0" y1="${y}"     x2="${W}" y2="${y}"     stroke="#200c00" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="${H - y}" x2="${W}" y2="${H - y}" stroke="#200c00" stroke-width="1.5" opacity="0.4"/>
  `).join('')}
  <!-- Vertical plank dividers on side borders -->
  ${[hB].map(x => `
  <line x1="${x}" y1="0" x2="${x}" y2="${H}" stroke="#200c00" stroke-width="2" opacity="0.35"/>
  <line x1="${W - x}" y1="0" x2="${W - x}" y2="${H}" stroke="#200c00" stroke-width="2" opacity="0.35"/>
  `).join('')}

  <!-- Warm candle-glow inner border -->
  <rect x="${B - 9}" y="${B - 9}" width="${W - B * 2 + 18}" height="${H - B * 2 + 18}" fill="none"
    stroke="#c06008" stroke-width="4" filter="url(#warmGlow)" opacity="0.7"/>
  <rect x="${B - 4}" y="${B - 4}" width="${W - B * 2 + 8}" height="${H - B * 2 + 8}" fill="none"
    stroke="url(#candleGlow)" stroke-width="2" opacity="0.85"/>
  <rect x="${B - 1}" y="${B - 1}" width="${W - B * 2 + 2}" height="${H - B * 2 + 2}" fill="none"
    stroke="#f0c060" stroke-width="1" opacity="0.6"/>

  <!-- Iron corner brackets (L-shaped, wrought iron look) -->
  ${[[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]].map(([px, py, sx, sy]) => {
    const L = 52, T = 12;
    const x = px + (sx < 0 ? -L : 0);
    const y = py + (sy < 0 ? -T : 0);
    const bx = px + (sx < 0 ? -T : 0);
    const by = py + (sy < 0 ? -L : 0);
    return `
    <!-- Horizontal bar -->
    <rect x="${Math.min(px, px + sx * L)}" y="${py + (sy > 0 ? 0 : -T)}"
      width="${L}" height="${T}" rx="2" fill="#2a2a2a" filter="url(#ironShadow)"/>
    <!-- Vertical bar -->
    <rect x="${px + (sx > 0 ? 0 : -T)}" y="${Math.min(py, py + sy * L)}"
      width="${T}" height="${L}" rx="2" fill="#2a2a2a" filter="url(#ironShadow)"/>
    <!-- Corner rivet -->
    <circle cx="${px + sx * (T / 2)}" cy="${py + sy * (T / 2)}"
      r="5" fill="#3a3a3a" stroke="#585858" stroke-width="1.5"/>
    <circle cx="${px + sx * (T / 2)}" cy="${py + sy * (T / 2)}" r="2" fill="#5a5a5a"/>`;
  }).join('')}

  <!-- Top: two hanging hooks (sign mount hardware) -->
  ${[[cx - 200, 0], [cx + 200, 0]].map(([hx]) => `
  <!-- Hook bracket -->
  <rect x="${hx - 5}" y="0" width="10" height="30" rx="3" fill="#2a2a2a"/>
  <!-- Hook curl -->
  <path d="M ${hx},28 Q ${hx},42 ${hx - 12},42 Q ${hx - 20},42 ${hx - 20},34"
    fill="none" stroke="#2a2a2a" stroke-width="8" stroke-linecap="round"/>
  <!-- Chain links down from hook -->
  <ellipse cx="${hx}" cy="50" rx="5" ry="8" fill="none" stroke="#3a3a3a" stroke-width="2.5"/>
  <ellipse cx="${hx}" cy="58" rx="8" ry="4" fill="none" stroke="#3a3a3a" stroke-width="2.5"/>
  `).join('')}

  <!-- Iron nail studs along top/bottom borders -->
  ${Array.from({ length: 14 }, (_, i) => {
    const x = Math.round(80 + i * (W - 160) / 13);
    return `
    <circle cx="${x}" cy="${hB}" r="4.5" fill="#3a3a3a" stroke="#585858" stroke-width="1"/>
    <circle cx="${x}" cy="${hB}" r="2" fill="#4a4a4a"/>
    <circle cx="${x}" cy="${H - hB}" r="4.5" fill="#3a3a3a" stroke="#585858" stroke-width="1"/>
    <circle cx="${x}" cy="${H - hB}" r="2" fill="#4a4a4a"/>`;
  }).join('')}

  <!-- Side nail studs -->
  ${Array.from({ length: 7 }, (_, i) => {
    const y = Math.round(B + 20 + i * (H - B * 2 - 40) / 6);
    return `
    <circle cx="${hB}" cy="${y}" r="4.5" fill="#3a3a3a" stroke="#585858" stroke-width="1"/>
    <circle cx="${hB}" cy="${y}" r="2" fill="#4a4a4a"/>
    <circle cx="${W - hB}" cy="${y}" r="4.5" fill="#3a3a3a" stroke="#585858" stroke-width="1"/>
    <circle cx="${W - hB}" cy="${y}" r="2" fill="#4a4a4a"/>`;
  }).join('')}
</svg>`,
  },

  // ── 9. Treasure Map ──────────────────────────────────────────────────────
  {
    name: 'treasure-map.png',
    svg: () => {
      // Compass rose at (px,py), size r
      const compass = (px, py, r) => {
        const h = r * 0.45;
        return `
        <!-- Cardinal points (4-pointed star) -->
        <polygon points="${px},${py - r} ${px - 6},${py - h} ${px},${py} ${px + 6},${py - h}" fill="#5c3808"/>
        <polygon points="${px},${py + r} ${px - 6},${py + h} ${px},${py} ${px + 6},${py + h}" fill="#5c3808"/>
        <polygon points="${px + r},${py} ${px + h},${py - 6} ${px},${py} ${px + h},${py + 6}" fill="#5c3808"/>
        <polygon points="${px - r},${py} ${px - h},${py - 6} ${px},${py} ${px - h},${py + 6}" fill="#5c3808"/>
        <!-- Diagonal tick lines -->
        <line x1="${px - r * 0.65}" y1="${py - r * 0.65}" x2="${px + r * 0.65}" y2="${py + r * 0.65}"
          stroke="#5c3808" stroke-width="1.2" opacity="0.5"/>
        <line x1="${px + r * 0.65}" y1="${py - r * 0.65}" x2="${px - r * 0.65}" y2="${py + r * 0.65}"
          stroke="#5c3808" stroke-width="1.2" opacity="0.5"/>
        <!-- Outer ring -->
        <circle cx="${px}" cy="${py}" r="${r + 3}" fill="none" stroke="#5c3808" stroke-width="1.5" opacity="0.6"/>
        <!-- Center dot -->
        <circle cx="${px}" cy="${py}" r="4" fill="#5c3808"/>
        <circle cx="${px}" cy="${py}" r="2" fill="#c8900a"/>`;
      };

      // X marker
      const xMark = (px, py, s, color) => `
        <line x1="${px - s}" y1="${py - s}" x2="${px + s}" y2="${py + s}"
          stroke="${color}" stroke-width="4" stroke-linecap="round"/>
        <line x1="${px + s}" y1="${py - s}" x2="${px - s}" y2="${py + s}"
          stroke="${color}" stroke-width="4" stroke-linecap="round"/>`;

      return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="mapParch" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#c8a040"/>
      <stop offset="40%"  stop-color="#b08828"/>
      <stop offset="100%" stop-color="#a07020"/>
    </linearGradient>
    <linearGradient id="mapParchH" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#e8c060" stop-opacity="0.3"/>
      <stop offset="50%"  stop-color="#b08828" stop-opacity="0"/>
      <stop offset="100%" stop-color="#e8c060" stop-opacity="0.2"/>
    </linearGradient>
  </defs>

  <!-- Sandy parchment border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#mapParch)"/>
  <path fill-rule="evenodd" d="${fp()}" fill="url(#mapParchH)"/>

  <!-- Aged outer edge -->
  <rect x="0" y="0" width="${W}" height="${H}" fill="none"
    stroke="#7a5010" stroke-width="20" opacity="0.25"/>

  <!-- Torn-paper inner border (irregular dasharray) -->
  <rect x="${B - 6}" y="${B - 6}" width="${W - B * 2 + 12}" height="${H - B * 2 + 12}" fill="none"
    stroke="#7a5010" stroke-width="4" stroke-dasharray="3,6,9,4,6,11,5,3,8,5" opacity="0.75"/>
  <rect x="${B - 2}" y="${B - 2}" width="${W - B * 2 + 4}" height="${H - B * 2 + 4}" fill="none"
    stroke="#a07020" stroke-width="1.5" stroke-dasharray="5,8,12,5,7,10,4" opacity="0.55"/>

  <!-- Compass rose — top-left corner -->
  ${compass(hB, hB, hB - 10)}

  <!-- X marks — bottom-right corner -->
  ${xMark(W - hB, H - hB, 18, '#8b1a1a')}
  <circle cx="${W - hB}" cy="${H - hB}" r="22" fill="none" stroke="#8b1a1a" stroke-width="2" opacity="0.6"/>

  <!-- Dotted trail paths along borders (map route feel) -->
  <!-- Top border trail -->
  <line x1="${B + 20}" y1="${hB - 8}" x2="${W - B - 20}" y2="${hB - 8}"
    stroke="#6b4010" stroke-width="2" stroke-dasharray="4,8" opacity="0.5"/>
  <line x1="${B + 20}" y1="${hB + 8}" x2="${W - B - 20}" y2="${hB + 8}"
    stroke="#6b4010" stroke-width="2" stroke-dasharray="4,8" stroke-dashoffset="6" opacity="0.4"/>
  <!-- Bottom border trail -->
  <line x1="${B + 20}" y1="${H - hB - 8}" x2="${W - B - 20}" y2="${H - hB - 8}"
    stroke="#6b4010" stroke-width="2" stroke-dasharray="4,8" opacity="0.5"/>
  <line x1="${B + 20}" y1="${H - hB + 8}" x2="${W - B - 20}" y2="${H - hB + 8}"
    stroke="#6b4010" stroke-width="2" stroke-dasharray="4,8" stroke-dashoffset="6" opacity="0.4"/>

  <!-- Wave symbols in side borders (sea indication) -->
  ${[[hB, cy - 40], [hB, cy], [hB, cy + 40],
     [W - hB, cy - 40], [W - hB, cy], [W - hB, cy + 40]].map(([px, py]) => `
  <path d="M ${px - 16},${py} Q ${px - 8},${py - 7} ${px},${py} Q ${px + 8},${py + 7} ${px + 16},${py}"
    fill="none" stroke="#5c6890" stroke-width="2" opacity="0.55"/>
  `).join('')}

  <!-- Top-right corner: small anchor symbol -->
  <!-- Anchor ring -->
  <circle cx="${W - hB}" cy="${hB - 12}" r="8" fill="none" stroke="#5c3808" stroke-width="2.5"/>
  <!-- Shank -->
  <line x1="${W - hB}" y1="${hB - 4}" x2="${W - hB}" y2="${hB + 14}"
    stroke="#5c3808" stroke-width="3.5" stroke-linecap="round"/>
  <!-- Stock -->
  <line x1="${W - hB - 14}" y1="${hB - 2}" x2="${W - hB + 14}" y2="${hB - 2}"
    stroke="#5c3808" stroke-width="2.5" stroke-linecap="round"/>
  <!-- Flukes -->
  <path d="M ${W - hB - 12},${hB + 8} Q ${W - hB - 17},${hB + 18} ${W - hB - 7},${hB + 19}
           L ${W - hB},${hB + 14} L ${W - hB + 7},${hB + 19}
           Q ${W - hB + 17},${hB + 18} ${W - hB + 12},${hB + 8}"
    fill="none" stroke="#5c3808" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Aged stain blotches -->
  <ellipse cx="160" cy="40" rx="80" ry="15" fill="#7a5010" opacity="0.08"/>
  <ellipse cx="${W - 220}" cy="${H - 36}" rx="100" ry="14" fill="#6a4008" opacity="0.1"/>
  <ellipse cx="${cx}" cy="32" rx="50" ry="10" fill="#c8a040" opacity="0.07"/>
  <ellipse cx="${hB + 60}" cy="${H - hB}" rx="40" ry="10" fill="#7a5010" opacity="0.06"/>
</svg>`;
    },
  },

  // ── 10. The Forge (Blacksmith) ───────────────────────────────────────────
  {
    name: 'blacksmith.png',
    svg: () => {
      // Draw crossed hammers at (px, py)
      const hammers = (px, py, len, color) => {
        const hw = 5, hLen = len * 0.35;
        return `
        <!-- Hammer 1 (tilted left) -->
        <line x1="${px - len * 0.5}" y1="${py + len * 0.5}"
              x2="${px + len * 0.3}" y2="${py - len * 0.3}"
          stroke="${color}" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
        <rect x="${(px + len * 0.12).toFixed(1)}" y="${(py - len * 0.48).toFixed(1)}"
          width="${hLen}" height="${hw * 2.5}" rx="2"
          fill="${color}" opacity="0.9"
          transform="rotate(-45 ${(px + len * 0.12).toFixed(1)} ${(py - len * 0.48).toFixed(1)})"/>
        <!-- Hammer 2 (tilted right) -->
        <line x1="${px + len * 0.5}" y1="${py + len * 0.5}"
              x2="${px - len * 0.3}" y2="${py - len * 0.3}"
          stroke="${color}" stroke-width="6" stroke-linecap="round" opacity="0.9"/>
        <rect x="${(px - len * 0.45).toFixed(1)}" y="${(py - len * 0.48).toFixed(1)}"
          width="${hLen}" height="${hw * 2.5}" rx="2"
          fill="${color}" opacity="0.9"
          transform="rotate(45 ${(px - len * 0.45).toFixed(1)} ${(py - len * 0.48).toFixed(1)})"/>`;
      };

      // Chain link row along a horizontal line at y, from x1 to x2
      const chainRow = (x1, x2, y, spacing = 24) => {
        const links = [];
        let x = x1 + 10;
        let i = 0;
        while (x < x2 - 10) {
          if (i % 2 === 0) {
            links.push(`<ellipse cx="${x.toFixed(0)}" cy="${y}" rx="10" ry="4.5"
              fill="none" stroke="#5a5a5a" stroke-width="2.5"/>`);
          } else {
            links.push(`<ellipse cx="${x.toFixed(0)}" cy="${y}" rx="4.5" ry="10"
              fill="none" stroke="#5a5a5a" stroke-width="2.5"/>`);
          }
          x += spacing / 2;
          i++;
        }
        return links.join('');
      };

      // Chain link column along a vertical line at x, from y1 to y2
      const chainCol = (x, y1, y2, spacing = 24) => {
        const links = [];
        let y = y1 + 10;
        let i = 0;
        while (y < y2 - 10) {
          if (i % 2 === 0) {
            links.push(`<ellipse cx="${x}" cy="${y.toFixed(0)}" rx="4.5" ry="10"
              fill="none" stroke="#5a5a5a" stroke-width="2.5"/>`);
          } else {
            links.push(`<ellipse cx="${x}" cy="${y.toFixed(0)}" rx="10" ry="4.5"
              fill="none" stroke="#5a5a5a" stroke-width="2.5"/>`);
          }
          y += spacing / 2;
          i++;
        }
        return links.join('');
      };

      return `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="iron" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#1e1e1e"/>
      <stop offset="50%"  stop-color="#141414"/>
      <stop offset="100%" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="ironSheen" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#4a4a4a" stop-opacity="0.3"/>
      <stop offset="50%"  stop-color="#141414" stop-opacity="0"/>
      <stop offset="100%" stop-color="#4a4a4a" stop-opacity="0.2"/>
    </linearGradient>
    <linearGradient id="forgeH" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#c04010"/>
      <stop offset="30%"  stop-color="#e06018"/>
      <stop offset="50%"  stop-color="#f08020"/>
      <stop offset="70%"  stop-color="#e06018"/>
      <stop offset="100%" stop-color="#c04010"/>
    </linearGradient>
    <linearGradient id="forgeV" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%"   stop-color="#c04010"/>
      <stop offset="30%"  stop-color="#e06018"/>
      <stop offset="50%"  stop-color="#f08020"/>
      <stop offset="70%"  stop-color="#e06018"/>
      <stop offset="100%" stop-color="#c04010"/>
    </linearGradient>
    <filter id="forgeGlow">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="forgeMid">
      <feGaussianBlur stdDeviation="3" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Dark iron border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#iron)"/>
  <path fill-rule="evenodd" d="${fp()}" fill="url(#ironSheen)"/>

  <!-- Hammered metal texture (subtle irregular patches) -->
  ${Array.from({ length: 30 }, (_, i) => {
    const t = i / 30;
    const px = Math.round(10 + (t * 7919) % (W - 20));
    const py = Math.round(5  + (t * 6271) % (B - 10));
    const r  = 4 + (i % 5) * 2;
    return `<circle cx="${px}" cy="${py}" r="${r}" fill="#282828" opacity="0.4"/>
    <circle cx="${px}" cy="${H - py}" r="${r}" fill="#282828" opacity="0.4"/>`;
  }).join('')}

  <!-- Forge orange glow — inner edge (top/bottom) -->
  <rect x="${B - 12}" y="${B - 12}" width="${W - B * 2 + 24}" height="${H - B * 2 + 24}" fill="none"
    stroke="#c04010" stroke-width="6" filter="url(#forgeGlow)" opacity="0.9"/>
  <rect x="${B - 6}" y="${B - 6}" width="${W - B * 2 + 12}" height="${H - B * 2 + 12}" fill="none"
    stroke="#f08020" stroke-width="3" filter="url(#forgeMid)" opacity="0.85"/>
  <rect x="${B - 2}" y="${B - 2}" width="${W - B * 2 + 4}" height="${H - B * 2 + 4}" fill="none"
    stroke="#ffa040" stroke-width="1.5" opacity="0.8"/>

  <!-- Chain links — top border center line -->
  ${chainRow(B, W - B, hB)}
  <!-- Chain links — bottom border center line -->
  ${chainRow(B, W - B, H - hB)}
  <!-- Chain links — left border center line -->
  ${chainCol(hB, B, H - B)}
  <!-- Chain links — right border center line -->
  ${chainCol(W - hB, B, H - B)}

  <!-- Corner: crossed hammers -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) =>
    hammers(px, py, 38, '#888888')
  ).join('')}

  <!-- Spark dots near inner edge -->
  ${Array.from({ length: 40 }, (_, i) => {
    const t = i / 40;
    const angle = t * Math.PI * 2;
    const dist = 8 + (i % 4) * 6;
    // Place sparks along inner border perimeter
    const sx = i % 4 === 0 ? B + Math.round(t * (W - B * 2)) : (i % 4 === 1 ? W - B : (i % 4 === 2 ? B : B + Math.round(t * (W - B * 2))));
    const sy = i % 4 === 0 ? B - dist : (i % 4 === 1 ? B + Math.round(t * (H - B * 2)) : (i % 4 === 2 ? H - B + dist : H - B));
    const sr = 1 + (i % 3) * 0.8;
    const bright = i % 3 === 0 ? '#ffc060' : (i % 3 === 1 ? '#ff8020' : '#ffdd80');
    return `<circle cx="${sx}" cy="${sy}" r="${sr.toFixed(1)}" fill="${bright}" opacity="${(0.4 + (i % 5) * 0.12).toFixed(2)}"/>`;
  }).join('')}

  <!-- Outer edge highlight -->
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="none"
    stroke="#4a4a4a" stroke-width="2" opacity="0.5"/>
</svg>`;
    },
  },
  // ── 11. Murder Mystery 2026 ──────────────────────────────────────────────
  {
    name: 'murder-mystery-2026.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="mmBorder" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0d0808"/>
      <stop offset="50%"  stop-color="#130a0a"/>
      <stop offset="100%" stop-color="#0d0808"/>
    </linearGradient>
    <linearGradient id="mmRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#4a0000"/>
      <stop offset="30%"  stop-color="#7a0000"/>
      <stop offset="50%"  stop-color="#8B0000"/>
      <stop offset="70%"  stop-color="#7a0000"/>
      <stop offset="100%" stop-color="#4a0000"/>
    </linearGradient>
    <linearGradient id="mmGold" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#7a5800"/>
      <stop offset="50%"  stop-color="#d4a017"/>
      <stop offset="100%" stop-color="#7a5800"/>
    </linearGradient>
    <filter id="mmDrop">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#000" flood-opacity="0.8"/>
    </filter>
  </defs>

  <!-- Near-black border base -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#mmBorder)"/>

  <!-- Subtle dark texture lines (horizontal grain) -->
  ${Array.from({ length: 8 }, (_, i) => {
    const y = 8 + i * 7;
    return `
    <line x1="0" y1="${y}"     x2="${W}" y2="${y}"     stroke="#ffffff" stroke-width="0.5" opacity="0.03"/>
    <line x1="0" y1="${H - y}" x2="${W}" y2="${H - y}" stroke="#ffffff" stroke-width="0.5" opacity="0.03"/>`;
  }).join('')}

  <!-- Gold outer frame lines -->
  <rect x="4" y="4" width="${W - 8}" height="${H - 8}" fill="none"
    stroke="url(#mmGold)" stroke-width="1.5" opacity="0.7"/>
  <rect x="8" y="8" width="${W - 16}" height="${H - 16}" fill="none"
    stroke="url(#mmGold)" stroke-width="0.5" opacity="0.35"/>

  <!-- Gold inner frame lines -->
  <rect x="${B - 4}" y="${B - 4}" width="${W - B * 2 + 8}" height="${H - B * 2 + 8}" fill="none"
    stroke="url(#mmGold)" stroke-width="1.5" opacity="0.7"/>
  <rect x="${B - 1}" y="${B - 1}" width="${W - B * 2 + 2}" height="${H - B * 2 + 2}" fill="none"
    stroke="url(#mmGold)" stroke-width="0.5" opacity="0.35"/>

  <!-- Corner ornaments: gold diamond + dot -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) => `
  <polygon points="${px},${py - 18} ${px + 18},${py} ${px},${py + 18} ${px - 18},${py}"
    fill="none" stroke="url(#mmGold)" stroke-width="1.5" opacity="0.8"/>
  <polygon points="${px},${py - 10} ${px + 10},${py} ${px},${py + 10} ${px - 10},${py}"
    fill="#8B0000" opacity="0.9"/>
  <circle cx="${px}" cy="${py}" r="3.5" fill="url(#mmGold)" opacity="0.9"/>`).join('')}

  <!-- Mid-side gold fleur ornaments -->
  ${[[hB, cy], [W - hB, cy]].map(([px, py]) => `
  <line x1="${px}" y1="${py - 24}" x2="${px}" y2="${py + 24}"
    stroke="url(#mmGold)" stroke-width="1.5" opacity="0.7"/>
  <circle cx="${px}" cy="${py}" r="5" fill="#8B0000" opacity="0.9"/>
  <circle cx="${px}" cy="${py}" r="2.5" fill="url(#mmGold)" opacity="0.9"/>
  <circle cx="${px}" cy="${py - 16}" r="3" fill="url(#mmGold)" opacity="0.6"/>
  <circle cx="${px}" cy="${py + 16}" r="3" fill="url(#mmGold)" opacity="0.6"/>`).join('')}

  <!-- TOP: solid dark-red ribbon banner -->
  <rect x="120" y="8" width="${W - 240}" height="${B - 14}" rx="3" fill="url(#mmRibbon)" filter="url(#mmDrop)"/>
  <!-- ribbon tails (left) -->
  <polygon points="120,8 130,${(B - 14) / 2 + 8} 120,${B - 6}" fill="#4a0000"/>
  <!-- ribbon tails (right) -->
  <polygon points="${W - 120},8 ${W - 130},${(B - 14) / 2 + 8} ${W - 120},${B - 6}" fill="#4a0000"/>
  <!-- gold border lines on ribbon -->
  <rect x="120" y="8" width="${W - 240}" height="${B - 14}" rx="3"
    fill="none" stroke="url(#mmGold)" stroke-width="1" opacity="0.6"/>
  <!-- MURDER MYSTERY text on ribbon — cream/ivory, high contrast on dark red -->
  <text x="${cx}" y="${(B - 6) / 2 + 8}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="20" font-weight="bold" letter-spacing="8"
    fill="#f5e0c0">MURDER MYSTERY</text>

  <!-- BOTTOM: solid dark-red ribbon banner -->
  <rect x="200" y="${H - B + 6}" width="${W - 400}" height="${B - 14}" rx="3" fill="url(#mmRibbon)" filter="url(#mmDrop)"/>
  <polygon points="200,${H - B + 6} 210,${H - B + 6 + (B - 14) / 2} 200,${H - 8}" fill="#4a0000"/>
  <polygon points="${W - 200},${H - B + 6} ${W - 210},${H - B + 6 + (B - 14) / 2} ${W - 200},${H - 8}" fill="#4a0000"/>
  <rect x="200" y="${H - B + 6}" width="${W - 400}" height="${B - 14}" rx="3"
    fill="none" stroke="url(#mmGold)" stroke-width="1" opacity="0.6"/>
  <!-- 2026 text -->
  <text x="${cx}" y="${H - B + 6 + (B - 14) / 2}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="22" font-weight="bold" letter-spacing="14"
    fill="#f5e0c0">— 2026 —</text>

  <!-- Side labels: rotated, gold on dark, clear contrast -->
  <text x="${hB}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="11" font-weight="bold" letter-spacing="5"
    fill="url(#mmGold)" opacity="0.85" transform="rotate(-90,${hB},${cy})">SUSPECT</text>
  <text x="${W - hB}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="11" font-weight="bold" letter-spacing="5"
    fill="url(#mmGold)" opacity="0.85" transform="rotate(90,${W - hB},${cy})">SUSPECT</text>
</svg>`,
  },

  // ── 12. Dead Man's Masquerade ────────────────────────────────────────────
  {
    name: 'dead-mans-masquerade.png',
    svg: () => `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="darkSea" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%"   stop-color="#0a0a1a"/>
      <stop offset="40%"  stop-color="#0f1a2a"/>
      <stop offset="100%" stop-color="#0a0a1a"/>
    </linearGradient>
    <linearGradient id="goldShine" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%"   stop-color="#8B6914"/>
      <stop offset="50%"  stop-color="#E8B700"/>
      <stop offset="100%" stop-color="#8B6914"/>
    </linearGradient>
    <filter id="goldGlow">
      <feGaussianBlur stdDeviation="4" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <filter id="skullGlow">
      <feGaussianBlur stdDeviation="2.5" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Deep navy border -->
  <path fill-rule="evenodd" d="${fp()}" fill="url(#darkSea)"/>

  <!-- Gold outer edge -->
  <rect x="3" y="3" width="${W - 6}" height="${H - 6}" fill="none"
    stroke="url(#goldShine)" stroke-width="2.5" opacity="0.8"/>
  <!-- Gold inner edge -->
  <rect x="${B - 5}" y="${B - 5}" width="${W - B * 2 + 10}" height="${H - B * 2 + 10}" fill="none"
    stroke="url(#goldShine)" stroke-width="1.5" opacity="0.6"/>
  <rect x="${B - 2}" y="${B - 2}" width="${W - B * 2 + 4}" height="${H - B * 2 + 4}" fill="none"
    stroke="#8B0000" stroke-width="1" opacity="0.5"/>

  <!-- Rope pattern along top/bottom (dots) -->
  ${Array.from({ length: 60 }, (_, i) => {
    const x = 10 + i * (W - 20) / 59;
    return `
    <circle cx="${x}" cy="16" r="3.5" fill="#4a3010" opacity="0.7"/>
    <circle cx="${x}" cy="16" r="1.5" fill="#8B6914" opacity="0.5"/>
    <circle cx="${x}" cy="${H - 16}" r="3.5" fill="#4a3010" opacity="0.7"/>
    <circle cx="${x}" cy="${H - 16}" r="1.5" fill="#8B6914" opacity="0.5"/>`;
  }).join('')}
  ${Array.from({ length: 30 }, (_, i) => {
    const y = 10 + i * (H - 20) / 29;
    return `
    <circle cx="16" cy="${y}" r="3.5" fill="#4a3010" opacity="0.7"/>
    <circle cx="16" cy="${y}" r="1.5" fill="#8B6914" opacity="0.5"/>
    <circle cx="${W - 16}" cy="${y}" r="3.5" fill="#4a3010" opacity="0.7"/>
    <circle cx="${W - 16}" cy="${y}" r="1.5" fill="#8B6914" opacity="0.5"/>`;
  }).join('')}

  <!-- Corner skulls -->
  ${[[hB, hB], [W - hB, hB], [hB, H - hB], [W - hB, H - hB]].map(([px, py]) => `
  <g transform="translate(${px},${py})" filter="url(#skullGlow)">
    <!-- Skull head -->
    <ellipse cx="0" cy="-6" rx="14" ry="13" fill="#d4c8a0" opacity="0.85"/>
    <!-- Jaw -->
    <rect x="-8" y="4" width="16" height="8" rx="3" fill="#d4c8a0" opacity="0.85"/>
    <!-- Eye sockets -->
    <ellipse cx="-5" cy="-7" rx="4" ry="4.5" fill="#0a0a1a"/>
    <ellipse cx="5"  cy="-7" rx="4" ry="4.5" fill="#0a0a1a"/>
    <!-- Nose -->
    <path d="M -2,-1 L 0,3 L 2,-1 Z" fill="#0a0a1a" opacity="0.8"/>
    <!-- Teeth -->
    <rect x="-7" y="5" width="3.5" height="5" rx="1" fill="#0a0a1a" opacity="0.7"/>
    <rect x="-2.5" y="5" width="3.5" height="5" rx="1" fill="#0a0a1a" opacity="0.7"/>
    <rect x="2" y="5" width="3.5" height="5" rx="1" fill="#0a0a1a" opacity="0.7"/>
    <!-- Crossed bones -->
    <line x1="-20" y1="18" x2="20" y2="6"  stroke="#d4c8a0" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
    <line x1="-20" y1="6"  x2="20" y2="18" stroke="#d4c8a0" stroke-width="5" stroke-linecap="round" opacity="0.7"/>
    <circle cx="-20" cy="12" r="5" fill="#d4c8a0" opacity="0.7"/>
    <circle cx="20"  cy="12" r="5" fill="#d4c8a0" opacity="0.7"/>
    <circle cx="0"   cy="12" r="4" fill="#d4c8a0" opacity="0.7"/>
  </g>`).join('')}

  <!-- Mid-side daggers -->
  ${[[hB, cy], [W - hB, cy]].map(([px, py]) => `
  <g transform="translate(${px},${py}) rotate(${px < cx ? 90 : -90})">
    <polygon points="0,-22 4,6 0,12 -4,6" fill="#E8B700" opacity="0.85"/>
    <rect x="-10" y="4" width="20" height="5" rx="1.5" fill="#8B0000"/>
    <rect x="-4.5" y="9" width="9" height="14" rx="2" fill="#2a0a00"/>
    <circle cx="0" cy="24" r="4.5" fill="#E8B700" opacity="0.8"/>
  </g>`).join('')}

  <!-- TOP BANNER: DEAD MAN'S MASQUERADE -->
  <text x="${cx}" y="31" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="22" font-weight="bold" letter-spacing="7"
    fill="#0a0a1a" filter="url(#goldGlow)" opacity="0.5">☠ DEAD MAN'S MASQUERADE ☠</text>
  <text x="${cx}" y="31" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="22" font-weight="bold" letter-spacing="7"
    fill="#E8B700" opacity="0.95">☠ DEAD MAN'S MASQUERADE ☠</text>

  <!-- BOTTOM BANNER -->
  <text x="${cx}" y="${H - 31}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="18" font-weight="bold" letter-spacing="6"
    fill="#0a0a1a" filter="url(#goldGlow)" opacity="0.5">WHO DONE IT?</text>
  <text x="${cx}" y="${H - 31}" text-anchor="middle" dominant-baseline="middle"
    font-family="Georgia, serif" font-size="18" font-weight="bold" letter-spacing="6"
    fill="#E8B700" opacity="0.9">WHO DONE IT?</text>
</svg>`,
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
