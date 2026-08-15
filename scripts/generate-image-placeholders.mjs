/**
 * Generates SVG placeholder files for required image assets.
 * Replace each .svg with your final .png / .jpg (same base name) when ready.
 *
 * Run: node scripts/generate-image-placeholders.mjs
 */
import { mkdirSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const imagesRoot = join(__dirname, "..", "src", "assets", "images");

/** @type {{ dir: string; file: string; label: string; width?: number; height?: number }[]} */
const placeholders = [
  {
    dir: "landing",
    file: "hero-studio-mockup",
    label: "hero-studio-mockup.png",
    width: 1400,
    height: 875,
  },
  {
    dir: "landing/experience",
    file: "experience-dashboard-mockup",
    label: "experience-dashboard-mockup.png",
    width: 800,
    height: 520,
  },
  {
    dir: "landing/experience",
    file: "experience-architecture-photo",
    label: "experience-architecture-photo.png",
    width: 800,
    height: 520,
  },
  {
    dir: "landing/experience",
    file: "experience-crm-mobile",
    label: "experience-crm-mobile.png",
    width: 1200,
    height: 520,
  },
  {
    dir: "landing/gallery/wedding",
    file: "gallery-wedding-couple",
    label: "gallery-wedding-couple.png",
  },
  {
    dir: "landing/gallery/wedding",
    file: "gallery-wedding-detail-clock",
    label: "gallery-wedding-detail-clock.png",
  },
  {
    dir: "landing/gallery/wedding",
    file: "gallery-wedding-celebration",
    label: "gallery-wedding-celebration.png",
  },
  {
    dir: "landing/gallery/wedding",
    file: "gallery-wedding-headshot",
    label: "gallery-wedding-headshot.png",
  },
  {
    dir: "landing/gallery/wedding",
    file: "gallery-wedding-event",
    label: "gallery-wedding-event.png",
  },
  {
    dir: "landing/gallery/portrait",
    file: "gallery-portrait-headshot",
    label: "gallery-portrait-headshot.png",
  },
  {
    dir: "landing/gallery/portrait",
    file: "gallery-portrait-studio",
    label: "gallery-portrait-studio.png",
  },
  {
    dir: "landing/gallery/portrait",
    file: "gallery-portrait-fashion",
    label: "gallery-portrait-fashion.png",
  },
  {
    dir: "landing/gallery/portrait",
    file: "gallery-portrait-creative",
    label: "gallery-portrait-creative.png",
  },
  {
    dir: "landing/gallery/portrait",
    file: "gallery-portrait-outdoor",
    label: "gallery-portrait-outdoor.png",
  },
  {
    dir: "landing/gallery/graduation",
    file: "gallery-graduation-cap-gown",
    label: "gallery-graduation-cap-gown.png",
  },
  {
    dir: "landing/gallery/graduation",
    file: "gallery-graduation-celebration",
    label: "gallery-graduation-celebration.png",
  },
  {
    dir: "landing/gallery/graduation",
    file: "gallery-graduation-campus",
    label: "gallery-graduation-campus.png",
  },
  {
    dir: "landing/gallery/graduation",
    file: "gallery-graduation-portrait",
    label: "gallery-graduation-portrait.png",
  },
  {
    dir: "landing/gallery/graduation",
    file: "gallery-graduation-group",
    label: "gallery-graduation-group.png",
  },
  {
    dir: "landing/testimonials",
    file: "testimonial-sarah-jenkins-avatar",
    label: "testimonial-sarah-jenkins-avatar.png",
    width: 80,
    height: 80,
  },
  {
    dir: "landing/testimonials",
    file: "testimonial-marcus-thorne-avatar",
    label: "testimonial-marcus-thorne-avatar.png",
    width: 80,
    height: 80,
  },
  {
    dir: "auth",
    file: "login-side-bg",
    label: "login-side-bg.png",
    width: 960,
    height: 1080,
  },
  {
    dir: "auth",
    file: "app-logo-gold",
    label: "app-logo-gold.png",
    width: 160,
    height: 40,
  },
  {
    dir: "icons",
    file: "google-icon",
    label: "google-icon.png",
    width: 24,
    height: 24,
  },
  {
    dir: "onboarding",
    file: "role-photographer-preview",
    label: "role-photographer-preview.png",
    width: 480,
    height: 360,
  },
  {
    dir: "onboarding",
    file: "role-client-preview",
    label: "role-client-preview.png",
    width: 480,
    height: 360,
  },
  {
    dir: "photographer",
    file: "booking-elena-rodriguez-avatar",
    label: "booking-elena-rodriguez-avatar.png",
    width: 80,
    height: 80,
  },
  {
    dir: "photographer",
    file: "booking-receipt-preview",
    label: "booking-receipt-preview.png",
    width: 800,
    height: 320,
  },
];

function svgPlaceholder({ label, width = 800, height = 600 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img">
  <rect width="100%" height="100%" fill="#ececec"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" fill="none" stroke="#c9c9c9" stroke-width="2" stroke-dasharray="8 6"/>
  <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.min(16, width / 24)}" fill="#6b6b6b">${label}</text>
  <text x="50%" y="56%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui,sans-serif" font-size="${Math.min(12, width / 32)}" fill="#9ca3af">Replace with final asset</text>
</svg>`;
}

for (const item of placeholders) {
  const dirPath = join(imagesRoot, item.dir);
  mkdirSync(dirPath, { recursive: true });
  const filePath = join(dirPath, `${item.file}.svg`);
  writeFileSync(
    filePath,
    svgPlaceholder({
      label: item.label,
      width: item.width,
      height: item.height,
    }),
    "utf8",
  );
  console.log(`Created ${filePath}`);
}

console.log(`\nDone. ${placeholders.length} placeholders created.`);
