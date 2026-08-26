import { appAssets, landingAssets, photographerAssets } from "@/constants/assets";

/**
 * Canonical people and organization names for mock data.
 * Import from here so the same person appears consistently across screens.
 */
export const STUDIO_OWNER = {
  name: "Imani Uwase",
  firstName: "Imani",
  role: "Event Photographer",
  email: "imani.uwase@shutterdesk.rw",
  avatar: appAssets.userAvatar,
} as const;

export const DEMO_CREDENTIALS = {
  email: STUDIO_OWNER.email,
  password: "password123",
} as const;

export const AVATARS = {
  clientA: landingAssets.testimonials.sarahJenkinsAvatar,
  clientB: landingAssets.testimonials.marcusThorneAvatar,
  clientC: photographerAssets.bookingElenaRodriguezAvatar,
  user: appAssets.userAvatar,
} as const;

export const TESTIMONIAL_PHOTOGRAPHERS = [
  {
    name: "Chantal Mukamana",
    role: "Editorial Photographer",
    avatar: AVATARS.clientA,
  },
  {
    name: "Eric Habimana",
    role: "Wedding Photographer",
    avatar: AVATARS.clientB,
  },
] as const;

/** Primary CRM clients — ids must stay stable across mocks */
export const CLIENT_ROSTER = {
  immaculee: {
    id: "1",
    name: "Immaculée Niyonsaba",
    email: "immaculee.niyonsaba@gmail.com",
    phone: "+250 788 412 890",
    avatar: AVATARS.clientA,
  },
  jeanBaptiste: {
    id: "2",
    name: "Jean-Baptiste Mugisha",
    email: "jb.mugisha@kigaliagency.rw",
    phone: "+250 788 321 654",
    avatar: AVATARS.clientB,
  },
  grace: {
    id: "3",
    name: "Grace Uwera",
    email: "grace.uwera@gmail.com",
    phone: "+250 788 901 234",
    avatar: AVATARS.clientC,
  },
  patrick: {
    id: "4",
    name: "Patrick Nkurunziza",
    email: "patrick.nkurunziza@studio.rw",
    phone: "+250 788 567 123",
    avatar: AVATARS.user,
  },
} as const;

export const CLIENT_PEOPLE = {
  aline: {
    name: "Aline Mutoni",
    email: "aline.mutoni@gmail.com",
    avatar: AVATARS.clientA,
  },
  david: {
    name: "David Ntwali",
    email: "david.ntwali@corporate.rw",
    avatar: AVATARS.clientB,
  },
  benedicte: {
    name: "Benedicte Mukeshimana",
    email: "benedicte.m@gmail.com",
    avatar: AVATARS.clientC,
  },
  fabrice: {
    name: "Fabrice Kwizera",
    email: "fabrice.kwizera@corporate.rw",
    avatar: AVATARS.user,
  },
  claude: {
    name: "Claude Ishimwe",
    email: "claude.ishimwe@events.rw",
    avatar: AVATARS.clientB,
  },
} as const;

export const COUPLES = {
  niyonsaba: "Immaculée & Patrick Niyonsaba",
  mugisha: "Jean-Baptiste & Aline Mugisha",
  nkurunziza: "Patrick & Claire Nkurunziza",
} as const;

/** Primary wedding couple shown on dashboard and calendar */
export const FEATURED_WEDDING_COUPLE = COUPLES.niyonsaba;

export const ORGANIZATIONS = {
  greenHillsAcademy: "Green Hills Academy",
  kigaliCreativeAgency: "Kigali Creative Agency",
  amahoroMedia: "Amahoro Media Group",
} as const;
