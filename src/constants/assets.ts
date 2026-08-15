/**
 * Central image asset registry.
 * Uses assetUrl() so uploaded .png files are used automatically (over .svg placeholders).
 *
 * @see docs/ASSETS.md
 */

import { assetUrl } from "@/lib/asset-url";

export const landingAssets = {
  hero: {
    studioMockup: assetUrl("landing/hero-studio-mockup"),
  },
  experience: {
    dashboardMockup: assetUrl("landing/experience/experience-dashboard-mockup"),
    architecturePhoto: assetUrl(
      "landing/experience/experience-architecture-photo",
    ),
    crmMobile: assetUrl("landing/experience/experience-crm-mobile"),
  },
  gallery: {
    wedding: [
      {
        src: assetUrl("landing/gallery/wedding/gallery-wedding-couple"),
        alt: "Wedding couple portrait",
      },
      {
        src: assetUrl("landing/gallery/wedding/gallery-wedding-detail-clock"),
        alt: "Elegant clock detail",
      },
      {
        src: assetUrl("landing/gallery/wedding/gallery-wedding-celebration"),
        alt: "Wedding celebration",
      },
      {
        src: assetUrl("landing/gallery/wedding/gallery-wedding-headshot"),
        alt: "Professional headshot",
      },
      {
        src: assetUrl("landing/gallery/wedding/gallery-wedding-event"),
        alt: "Event photography",
      },
    ],
    portrait: [
      {
        src: assetUrl("landing/gallery/portrait/gallery-portrait-headshot"),
        alt: "Portrait headshot",
      },
      {
        src: assetUrl("landing/gallery/portrait/gallery-portrait-studio"),
        alt: "Studio portrait",
      },
      {
        src: assetUrl("landing/gallery/portrait/gallery-portrait-fashion"),
        alt: "Fashion portrait",
      },
      {
        src: assetUrl("landing/gallery/portrait/gallery-portrait-creative"),
        alt: "Creative portrait",
      },
      {
        src: assetUrl("landing/gallery/portrait/gallery-portrait-outdoor"),
        alt: "Outdoor portrait",
      },
    ],
    graduation: [
      {
        src: assetUrl("landing/gallery/graduation/gallery-graduation-cap-gown"),
        alt: "Graduation cap and gown",
      },
      {
        src: assetUrl(
          "landing/gallery/graduation/gallery-graduation-celebration",
        ),
        alt: "Graduates celebrating",
      },
      {
        src: assetUrl("landing/gallery/graduation/gallery-graduation-campus"),
        alt: "Campus graduation",
      },
      {
        src: assetUrl("landing/gallery/graduation/gallery-graduation-portrait"),
        alt: "Graduate portrait",
      },
      {
        src: assetUrl("landing/gallery/graduation/gallery-graduation-group"),
        alt: "Group graduation",
      },
    ],
  },
  testimonials: {
    sarahJenkinsAvatar: assetUrl(
      "landing/testimonials/testimonial-sarah-jenkins-avatar",
    ),
    marcusThorneAvatar: assetUrl(
      "landing/testimonials/testimonial-marcus-thorne-avatar",
    ),
  },
} as const;

/** App-wide assets (logo, avatars, etc.) */
export const appAssets = {
  /** `src/assets/images/landing/app-logo-black.png` */
  logoBlack: assetUrl("landing/app-logo-black"),
  logo: assetUrl("app-logo"),
  userAvatar: assetUrl("user-avatar"),
} as const;

/** Onboarding screens */
export const onboardingAssets = {
  /** `src/assets/images/onboarding/role-photographer-preview.png` */
  rolePhotographerPreview: assetUrl("onboarding/role-photographer-preview"),
  /** `src/assets/images/onboarding/role-client-preview.png` */
  roleClientPreview: assetUrl("onboarding/role-client-preview"),
} as const;

/** Photographer portal — client avatars, screen imagery */
export const photographerAssets = {
  /** `src/assets/images/photographer/booking-elena-rodriguez-avatar.png` */
  bookingElenaRodriguezAvatar: assetUrl(
    "photographer/booking-elena-rodriguez-avatar",
  ),
  /** `src/assets/images/photographer/booking-receipt-preview.png` */
  bookingReceiptPreview: assetUrl("photographer/booking-receipt-preview"),
} as const;

/** Auth screens */
export const authAssets = {
  /** `src/assets/images/auth/login-side-bg.png` */
  loginSideBg: assetUrl("auth/login-side-bg"),
  /** `src/assets/images/auth/app-logo-gold.png` */
  logoGold: assetUrl("auth/app-logo-gold"),
  /** `src/assets/images/icons/google-icon.png` */
  googleIcon: assetUrl("icons/google-icon"),
} as const;
