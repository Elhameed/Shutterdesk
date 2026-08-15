import { PrismaClient, UserRole, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEMO_PASSWORD = "password123";

const DEMO_USERS = [
  {
    email: "imani.uwase@shutterdesk.rw",
    fullName: "Imani Uwase",
    phone: "+250 788 100 200",
    role: UserRole.photographer,
  },
  {
    email: "eric.habimana@shutterdesk.rw",
    fullName: "Eric Habimana",
    phone: "+250 788 556 902",
    role: UserRole.photographer,
  },
  {
    email: "immaculee.niyonsaba@gmail.com",
    fullName: "Immaculée Niyonsaba",
    phone: "+250 788 412 890",
    role: UserRole.client,
  },
] as const;

const CRM_CLIENTS: Array<{
  email: string;
  name: string;
  phone: string;
  category: "wedding" | "commercial" | "portrait" | "editorial";
  tier: "vip" | "active" | "new";
  avatarAssetKey: string;
  bannerAssetKey: string;
  sessions: number;
  revenue: number;
  balance: number;
  reliability: number;
  rating: string;
  location: string;
  memberSince: Date;
  lastBookingAt: Date;
  createdAt: Date;
  linkToUserEmail?: string;
  preferences: Prisma.InputJsonValue;
  insights: Prisma.InputJsonValue;
  timeline: Prisma.InputJsonValue;
  projects: Prisma.InputJsonValue;
  invoices: Prisma.InputJsonValue;
  galleries: Prisma.InputJsonValue;
}> = [
  {
    email: "immaculee.niyonsaba@gmail.com",
    name: "Immaculée Niyonsaba",
    phone: "+250 788 412 890",
    category: "wedding",
    tier: "vip",
    avatarAssetKey: "landing/testimonials/testimonial-sarah-jenkins-avatar",
    bannerAssetKey: "landing/gallery/wedding/gallery-wedding-couple",
    sessions: 12,
    revenue: 2_300_000,
    balance: 410_000,
    reliability: 98,
    rating: "excellent",
    location: "Kigali, Rwanda",
    memberSince: new Date("2022-10-01"),
    lastBookingAt: new Date("2026-06-10"),
    createdAt: new Date("2022-03-14"),
    linkToUserEmail: "immaculee.niyonsaba@gmail.com",
    insights: { retention: "High", favType: "Wedding", avgValue: 190_000 },
    preferences: {
      primaryContact: "Email Only",
      artisticStyles: ["Minimalist", "Warm Noir", "High-Key"],
      editingPrefs:
        "Prefers natural skin textures and light retouching. Always requests B&W copies of key shots.",
      specialRequirements:
        "Sparkling water only on set. Prefers morning starts for outdoor sessions.",
    },
    timeline: [
      {
        id: "1",
        type: "upcoming",
        title: "Wedding Excellence Session",
        subtitle: "Kigali Convention Centre",
        date: "Jun 28, 2026",
        highlighted: true,
        linkText: "View Booking",
      },
      {
        id: "2",
        type: "payment",
        title: "Deposit Received",
        subtitle: "RWF 325,000 via MoMo",
        date: "Jun 12, 2026",
      },
      {
        id: "3",
        type: "gallery",
        title: "Engagement Gallery Delivered",
        date: "May 30, 2026",
        linkText: "Open Gallery",
      },
      {
        id: "4",
        type: "feedback",
        title: "5-Star Review",
        quote: "Imani captured our engagement beautifully. Every frame feels intentional.",
        rating: 5,
        date: "May 15, 2026",
      },
      {
        id: "5",
        type: "onboarded",
        title: "Client Onboarded",
        date: "Mar 14, 2022",
      },
    ],
    projects: [
      {
        id: "1",
        status: "upcoming",
        category: "Wedding Session",
        title: "Immaculée & Partner Wedding",
        date: "Jun 28, 2026",
        time: "10:00 AM",
        coverImage: "landing/gallery/wedding/gallery-wedding-couple",
      },
      {
        id: "2",
        status: "completed",
        category: "Engagement",
        title: "Engagement Session",
        date: "May 01, 2026",
        photoCount: 120,
        coverImage: "landing/gallery/wedding/gallery-wedding-event",
      },
    ],
    invoices: [
      {
        id: "1",
        number: "INV-7701",
        description: "Wedding Excellence Deposit",
        date: "Jun 12, 2026",
        amount: 325_000,
        status: "paid",
      },
      {
        id: "2",
        number: "INV-7702",
        description: "Wedding Balance",
        date: "Jun 28, 2026",
        amount: 410_000,
        status: "pending",
      },
    ],
    galleries: [
      {
        id: "1",
        title: "Engagement Highlights",
        itemCount: 48,
        privacy: "private",
        coverImage: "landing/gallery/wedding/gallery-wedding-headshot",
      },
    ],
  },
  {
    email: "jb.mugisha@kigaliagency.rw",
    name: "Jean-Baptiste Mugisha",
    phone: "+250 788 321 654",
    category: "commercial",
    tier: "active",
    avatarAssetKey: "landing/testimonials/testimonial-marcus-thorne-avatar",
    bannerAssetKey: "landing/gallery/wedding/gallery-wedding-celebration",
    sessions: 8,
    revenue: 1_020_000,
    balance: 180_000,
    reliability: 92,
    rating: "good",
    location: "Kigali, Rwanda",
    memberSince: new Date("2023-01-01"),
    lastBookingAt: new Date("2026-05-22"),
    createdAt: new Date("2023-01-20"),
    insights: { retention: "Medium", favType: "Commercial", avgValue: 127_500 },
    preferences: {
      primaryContact: "Phone",
      artisticStyles: ["Corporate", "Clean Editorial"],
      editingPrefs: "Brand-aligned color grading with logo-safe compositions.",
      specialRequirements: "Requires shot list approval 48 hours before session.",
    },
    timeline: [
      {
        id: "1",
        type: "payment",
        title: "Last booking on May 22, 2026",
        date: "May 22, 2026",
      },
      {
        id: "2",
        type: "onboarded",
        title: "Client Onboarded",
        date: "Jan 20, 2023",
      },
    ],
    projects: [
      {
        id: "1",
        status: "upcoming",
        category: "Commercial Session",
        title: "Jean-Baptiste Project",
        date: "May 22, 2026",
        time: "2:00 PM",
        coverImage: "landing/gallery/wedding/gallery-wedding-celebration",
      },
    ],
    invoices: [
      {
        id: "1",
        number: "INV-7702",
        description: "Commercial Deposit",
        date: "May 22, 2026",
        amount: 510_000,
        status: "pending",
      },
    ],
    galleries: [
      {
        id: "1",
        title: "Commercial Gallery",
        itemCount: 320,
        privacy: "private",
        coverImage: "landing/gallery/wedding/gallery-wedding-celebration",
      },
    ],
  },
  {
    email: "grace.uwera@gmail.com",
    name: "Grace Uwera",
    phone: "+250 788 901 234",
    category: "portrait",
    tier: "new",
    avatarAssetKey: "photographer/booking-elena-rodriguez-avatar",
    bannerAssetKey: "landing/gallery/portrait/gallery-portrait-outdoor",
    sessions: 1,
    revenue: 65_000,
    balance: 0,
    reliability: 100,
    rating: "good",
    location: "Kigali, Rwanda",
    memberSince: new Date("2025-04-01"),
    lastBookingAt: new Date("2026-05-01"),
    createdAt: new Date("2025-04-15"),
    insights: { retention: "New", favType: "Portrait", avgValue: 65_000 },
    preferences: {
      primaryContact: "Email Only",
      artisticStyles: ["Natural Light", "Editorial"],
      editingPrefs: "Standard retouching with natural color grading.",
      specialRequirements: "No special requirements noted.",
    },
    timeline: [
      {
        id: "1",
        type: "payment",
        title: "Last booking on May 01, 2026",
        date: "May 01, 2026",
      },
      {
        id: "2",
        type: "onboarded",
        title: "Client Onboarded",
        date: "Apr 15, 2025",
      },
    ],
    projects: [
      {
        id: "1",
        status: "completed",
        category: "Portrait Session",
        title: "Grace Project",
        date: "May 01, 2026",
        coverImage: "landing/gallery/portrait/gallery-portrait-outdoor",
      },
    ],
    invoices: [
      {
        id: "1",
        number: "INV-7703",
        description: "Portrait Deposit",
        date: "May 01, 2026",
        amount: 32_500,
        status: "paid",
      },
    ],
    galleries: [
      {
        id: "1",
        title: "Portrait Gallery",
        itemCount: 40,
        privacy: "private",
        coverImage: "landing/gallery/portrait/gallery-portrait-outdoor",
      },
    ],
  },
  {
    email: "patrick.nkurunziza@studio.rw",
    name: "Patrick Nkurunziza",
    phone: "+250 788 567 123",
    category: "editorial",
    tier: "active",
    avatarAssetKey: "app/user-avatar",
    bannerAssetKey: "landing/gallery/portrait/gallery-portrait-creative",
    sessions: 5,
    revenue: 480_000,
    balance: 40_000,
    reliability: 95,
    rating: "good",
    location: "Kigali, Rwanda",
    memberSince: new Date("2023-08-01"),
    lastBookingAt: new Date("2026-04-18"),
    createdAt: new Date("2023-08-12"),
    insights: { retention: "High", favType: "Editorial", avgValue: 96_000 },
    preferences: {
      primaryContact: "Email Only",
      artisticStyles: ["Natural Light", "Editorial"],
      editingPrefs: "Standard retouching with natural color grading.",
      specialRequirements: "No special requirements noted.",
    },
    timeline: [
      {
        id: "1",
        type: "payment",
        title: "Last booking on Apr 18, 2026",
        date: "Apr 18, 2026",
      },
      {
        id: "2",
        type: "onboarded",
        title: "Client Onboarded",
        date: "Aug 12, 2023",
      },
    ],
    projects: [
      {
        id: "1",
        status: "upcoming",
        category: "Editorial Session",
        title: "Patrick Project",
        date: "Apr 18, 2026",
        time: "2:00 PM",
        coverImage: "landing/gallery/portrait/gallery-portrait-creative",
      },
    ],
    invoices: [
      {
        id: "1",
        number: "INV-7704",
        description: "Editorial Deposit",
        date: "Apr 18, 2026",
        amount: 240_000,
        status: "pending",
      },
    ],
    galleries: [
      {
        id: "1",
        title: "Editorial Gallery",
        itemCount: 200,
        privacy: "private",
        coverImage: "landing/gallery/portrait/gallery-portrait-creative",
      },
    ],
  },
];

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);

  const usersByEmail = new Map<string, string>();

  for (const demoUser of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        fullName: demoUser.fullName,
        phone: demoUser.phone,
        role: demoUser.role,
        passwordHash,
      },
      create: {
        email: demoUser.email,
        fullName: demoUser.fullName,
        phone: demoUser.phone,
        role: demoUser.role,
        passwordHash,
      },
    });
    usersByEmail.set(demoUser.email, user.id);
  }

  const immaculeeUserId = usersByEmail.get("immaculee.niyonsaba@gmail.com");
  if (immaculeeUserId) {
    await prisma.user.update({
      where: { id: immaculeeUserId },
      data: {
        clientSettings: {
          phone: "+250 788 412 890",
          address: "Kigali, Rwanda",
          interests: ["Wedding", "Portrait"],
        },
      },
    });
  }

  const imaniUserId = usersByEmail.get("imani.uwase@shutterdesk.rw");
  if (!imaniUserId) {
    throw new Error("Failed to seed photographer user");
  }

  const ericUserId = usersByEmail.get("eric.habimana@shutterdesk.rw");
  if (!ericUserId) {
    throw new Error("Failed to seed second photographer user");
  }

  const studio = await prisma.studio.upsert({
    where: { slug: "imani-uwase-photography" },
    update: {
      name: "Imani Uwase Photography",
      ownerUserId: imaniUserId,
      avatarAssetKey: "app/user-avatar",
      paymentProfile: {
        provider: "MTN Mobile Money (MoMo)",
        mobileMoneyEnabled: true,
        merchantCode: "652930",
        momoAccountName: "Imani Uwase Photography Ltd",
        momoNumber: "+250 788 210 445",
        bankTransferEnabled: true,
        accountName: "Imani Uwase Photography Ltd",
        accountNumber: "1001234567",
        referenceHint: "Please include your Booking ID in the reference.",
        depositRequirement: "half",
      },
      profileSettings: {
        fullName: "Imani Uwase",
        displayName: "Imani",
        bio: "Award-winning event and portrait photographer based in Kigali. Specialized in capturing authentic moments with a clean, editorial aesthetic.",
        email: "imani.uwase@shutterdesk.rw",
        instagram: "instagram.com/imaniuwase",
        website: "shutterdesk.rw/studios/imani-uwase",
        avatar: "app/user-avatar",
      },
      brandSettings: {
        studioName: "Imani Uwase Photography",
        brandAccentColor: "#795900",
      },
      notificationPrefs: {
        newBooking: { email: true, sms: true, inApp: true },
        paymentReceived: { email: true, sms: true, inApp: true },
        galleryFavorites: { email: false, sms: false, inApp: true },
      },
      gallerySettings: {
        allowDownloads: true,
        passwordProtection: false,
        watermarkGridView: true,
        watermarkRemoveOnPaid: true,
        allowClientDisableWatermark: false,
      },
      securitySettings: { twoFactorEnabled: false },
      billingSettings: {
        invoices: [
          {
            id: "inv-2026-006",
            date: "Jun 01, 2026",
            invoice: "INV-2026-006",
            amount: 35000,
            status: "paid",
          },
          {
            id: "inv-2026-005",
            date: "May 01, 2026",
            invoice: "INV-2026-005",
            amount: 35000,
            status: "paid",
          },
        ],
      },
    },
    create: {
      ownerUserId: imaniUserId,
      name: "Imani Uwase Photography",
      slug: "imani-uwase-photography",
      avatarAssetKey: "app/user-avatar",
      paymentProfile: {
        provider: "MTN Mobile Money (MoMo)",
        mobileMoneyEnabled: true,
        merchantCode: "652930",
        momoAccountName: "Imani Uwase Photography Ltd",
        momoNumber: "+250 788 210 445",
        bankTransferEnabled: true,
        accountName: "Imani Uwase Photography Ltd",
        accountNumber: "1001234567",
        referenceHint: "Please include your Booking ID in the reference.",
        depositRequirement: "half",
      },
      profileSettings: {
        fullName: "Imani Uwase",
        displayName: "Imani",
        bio: "Award-winning event and portrait photographer based in Kigali. Specialized in capturing authentic moments with a clean, editorial aesthetic.",
        email: "imani.uwase@shutterdesk.rw",
        instagram: "instagram.com/imaniuwase",
        website: "shutterdesk.rw/studios/imani-uwase",
        avatar: "app/user-avatar",
      },
      brandSettings: {
        studioName: "Imani Uwase Photography",
        brandAccentColor: "#795900",
      },
      notificationPrefs: {
        newBooking: { email: true, sms: true, inApp: true },
        paymentReceived: { email: true, sms: true, inApp: true },
        galleryFavorites: { email: false, sms: false, inApp: true },
      },
      gallerySettings: {
        allowDownloads: true,
        passwordProtection: false,
        watermarkGridView: true,
        watermarkRemoveOnPaid: true,
        allowClientDisableWatermark: false,
      },
      securitySettings: { twoFactorEnabled: false },
      billingSettings: {
        invoices: [
          {
            id: "inv-2026-006",
            date: "Jun 01, 2026",
            invoice: "INV-2026-006",
            amount: 35000,
            status: "paid",
          },
          {
            id: "inv-2026-005",
            date: "May 01, 2026",
            invoice: "INV-2026-005",
            amount: 35000,
            status: "paid",
          },
        ],
      },
    },
  });

  const ericStudio = await prisma.studio.upsert({
    where: { slug: "eric-habimana-photography" },
    update: {
      name: "Eric Habimana Photography",
      ownerUserId: ericUserId,
      avatarAssetKey: "landing/testimonials/testimonial-marcus-thorne-avatar",
      paymentProfile: {
        provider: "MTN Mobile Money (MoMo)",
        mobileMoneyEnabled: true,
        merchantCode: "884521",
        momoAccountName: "Eric Habimana Studio",
        momoNumber: "+250 788 556 902",
        bankTransferEnabled: false,
        accountName: "",
        accountNumber: "",
        referenceHint: "Please include your Booking ID in the reference.",
        depositRequirement: "half",
      },
      brandSettings: {
        studioName: "Eric Habimana Photography",
        brandAccentColor: "#1E3A5F",
      },
      notificationPrefs: {
        newBooking: { email: true, sms: false, inApp: true },
        paymentReceived: { email: true, sms: false, inApp: true },
        galleryFavorites: { email: false, sms: false, inApp: true },
      },
      gallerySettings: {
        allowDownloads: true,
        passwordProtection: false,
        watermarkGridView: true,
        watermarkRemoveOnPaid: true,
        allowClientDisableWatermark: false,
      },
      securitySettings: { twoFactorEnabled: false },
      billingSettings: { invoices: [] },
    },
    create: {
      ownerUserId: ericUserId,
      name: "Eric Habimana Photography",
      slug: "eric-habimana-photography",
      avatarAssetKey: "landing/testimonials/testimonial-marcus-thorne-avatar",
      paymentProfile: {
        provider: "MTN Mobile Money (MoMo)",
        mobileMoneyEnabled: true,
        merchantCode: "884521",
        momoAccountName: "Eric Habimana Studio",
        momoNumber: "+250 788 556 902",
        bankTransferEnabled: false,
        accountName: "",
        accountNumber: "",
        referenceHint: "Please include your Booking ID in the reference.",
        depositRequirement: "half",
      },
      brandSettings: {
        studioName: "Eric Habimana Photography",
        brandAccentColor: "#1E3A5F",
      },
      notificationPrefs: {
        newBooking: { email: true, sms: false, inApp: true },
        paymentReceived: { email: true, sms: false, inApp: true },
        galleryFavorites: { email: false, sms: false, inApp: true },
      },
      gallerySettings: {
        allowDownloads: true,
        passwordProtection: false,
        watermarkGridView: true,
        watermarkRemoveOnPaid: true,
        allowClientDisableWatermark: false,
      },
      securitySettings: { twoFactorEnabled: false },
      billingSettings: { invoices: [] },
    },
  });

  for (const crmClient of CRM_CLIENTS) {
    const linkedUserId = crmClient.linkToUserEmail
      ? usersByEmail.get(crmClient.linkToUserEmail)
      : undefined;

    await prisma.studioClient.upsert({
      where: {
        studioId_email: {
          studioId: studio.id,
          email: crmClient.email,
        },
      },
      update: {
        name: crmClient.name,
        phone: crmClient.phone,
        category: crmClient.category,
        tier: crmClient.tier,
        avatarAssetKey: crmClient.avatarAssetKey,
        bannerAssetKey: crmClient.bannerAssetKey,
        sessions: crmClient.sessions,
        revenue: crmClient.revenue,
        balance: crmClient.balance,
        reliability: crmClient.reliability,
        rating: crmClient.rating,
        location: crmClient.location,
        memberSince: crmClient.memberSince,
        lastBookingAt: crmClient.lastBookingAt,
        linkedUserId: linkedUserId ?? null,
        preferences: crmClient.preferences,
        insights: crmClient.insights,
        timeline: crmClient.timeline,
        projects: crmClient.projects,
        invoices: crmClient.invoices,
        galleries: crmClient.galleries,
        createdAt: crmClient.createdAt,
      },
      create: {
        studioId: studio.id,
        linkedUserId: linkedUserId ?? null,
        name: crmClient.name,
        email: crmClient.email,
        phone: crmClient.phone,
        category: crmClient.category,
        tier: crmClient.tier,
        avatarAssetKey: crmClient.avatarAssetKey,
        bannerAssetKey: crmClient.bannerAssetKey,
        sessions: crmClient.sessions,
        revenue: crmClient.revenue,
        balance: crmClient.balance,
        reliability: crmClient.reliability,
        rating: crmClient.rating,
        location: crmClient.location,
        memberSince: crmClient.memberSince,
        lastBookingAt: crmClient.lastBookingAt,
        preferences: crmClient.preferences,
        insights: crmClient.insights,
        timeline: crmClient.timeline,
        projects: crmClient.projects,
        invoices: crmClient.invoices,
        galleries: crmClient.galleries,
        createdAt: crmClient.createdAt,
      },
    });
  }

  const clientsByEmail = new Map(
    (
      await prisma.studioClient.findMany({
        where: { studioId: studio.id },
        select: { id: true, email: true },
      })
    ).map((client) => [client.email, client.id]),
  );

  console.log(`Seeded CRM clients: ${CRM_CLIENTS.length}`);

  const SERVICE_PACKAGE_SEEDS = [
    {
      id: "1",
      title: "Luxury Wedding Collection",
      description:
        "Premium full-day wedding coverage with cinematic storytelling, two photographers, and a curated heirloom album.",
      price: 450_000,
      coverAssetKey: "landing/gallery/wedding/gallery-wedding-event",
      category: "wedding" as const,
      duration: "fullday",
      depositPercent: 50,
      isActive: true,
      totalRevenue: 5_400_000,
      metadata: {
        badges: ["popular", "public"],
        photographers: 2,
        locationType: "hybrid",
        editedPhotos: 500,
        revisions: 2,
        onlineGallery: true,
        printDelivery: true,
        includes: [
          "Two professional photographers",
          "Heirloom photo album",
          "Online private gallery",
          "Professional retouching",
        ],
        additionalNotes:
          "Travel within Kigali included. Extended coverage available on request.",
      },
    },
    {
      id: "2",
      title: "Editorial Headshot",
      description:
        "Studio portrait session with professional lighting setup and wardrobe guidance for corporate profiles.",
      price: 65_000,
      coverAssetKey: "landing/gallery/portrait/gallery-portrait-headshot",
      category: "portrait" as const,
      duration: "1hr",
      depositPercent: 30,
      isActive: true,
      totalRevenue: 950_000,
      metadata: {
        badges: ["new", "public"],
        photographers: 1,
        locationType: "studio",
        editedPhotos: 5,
        revisions: 1,
        onlineGallery: true,
        includes: [
          "Studio lighting setup",
          "5 retouched portraits",
          "Wardrobe guidance",
          "Digital delivery",
        ],
        additionalNotes: "Ideal for LinkedIn and corporate team profiles.",
      },
    },
    {
      id: "3",
      title: "Commercial Product",
      description:
        "High-end product photography for e-commerce and advertising with styled setups and color-accurate editing.",
      price: 250_000,
      coverAssetKey: "landing/experience/architecture-photo",
      category: "commercial" as const,
      duration: "fullday",
      depositPercent: 40,
      isActive: false,
      totalRevenue: 1_780_000,
      metadata: {
        badges: ["featured", "private"],
        photographers: 1,
        locationType: "studio",
        editedPhotos: 25,
        revisions: 2,
        commercialLicense: true,
        includes: [
          "Styled product setups",
          "25 deliverables",
          "Color-accurate editing",
          "Commercial usage license",
        ],
        additionalNotes: "Props and styling materials billed separately when required.",
      },
    },
    {
      id: "4",
      title: "Family Lifestyle",
      description:
        "Relaxed outdoor family session capturing authentic moments with a private online gallery for sharing.",
      price: 85_000,
      coverAssetKey: "landing/gallery/wedding/gallery-wedding-couple",
      category: "portrait" as const,
      duration: "2hr",
      depositPercent: 25,
      isActive: true,
      totalRevenue: 2_550_000,
      metadata: {
        badges: ["public"],
        photographers: 1,
        locationType: "outdoor",
        editedPhotos: 40,
        revisions: 1,
        onlineGallery: true,
        includes: [
          "Outdoor location session",
          "40 edited photos",
          "Private online gallery",
          "Full printing rights",
        ],
        additionalNotes: "Best scheduled during golden hour for outdoor sessions.",
      },
    },
  ];

  for (const seedPkg of SERVICE_PACKAGE_SEEDS) {
    await prisma.servicePackage.upsert({
      where: { id: seedPkg.id },
      update: {
        studioId: studio.id,
        title: seedPkg.title,
        description: seedPkg.description,
        price: seedPkg.price,
        coverAssetKey: seedPkg.coverAssetKey,
        category: seedPkg.category,
        duration: seedPkg.duration,
        depositPercent: seedPkg.depositPercent,
        isActive: seedPkg.isActive,
        totalRevenue: seedPkg.totalRevenue,
        metadata: seedPkg.metadata,
      },
      create: {
        id: seedPkg.id,
        studioId: studio.id,
        title: seedPkg.title,
        description: seedPkg.description,
        price: seedPkg.price,
        coverAssetKey: seedPkg.coverAssetKey,
        category: seedPkg.category,
        duration: seedPkg.duration,
        depositPercent: seedPkg.depositPercent,
        isActive: seedPkg.isActive,
        totalRevenue: seedPkg.totalRevenue,
        metadata: seedPkg.metadata,
      },
    });
  }

  console.log(`Seeded service packages: ${SERVICE_PACKAGE_SEEDS.length}`);

  const ERIC_SERVICE_PACKAGES = [
    {
      id: "eric-1",
      title: "Wedding Essentials",
      description:
        "Classic wedding coverage focused on key moments, clean edits, and a private gallery for sharing.",
      price: 320_000,
      coverAssetKey: "landing/gallery/wedding/gallery-wedding-celebration",
      category: "wedding" as const,
      duration: "fullday",
      depositPercent: 40,
      isActive: true,
      totalRevenue: 1_100_000,
      metadata: {
        badges: ["public", "featured"],
        photographers: 1,
        locationType: "hybrid",
        editedPhotos: 350,
        revisions: 1,
        onlineGallery: true,
        printDelivery: false,
        includes: ["Full-day coverage", "350 edited photos", "Private online gallery"],
        additionalNotes: "Travel within Kigali included.",
      },
    },
    {
      id: "eric-2",
      title: "Family Portrait Mini",
      description:
        "Outdoor family portrait session with warm edits and a small curated set of final images.",
      price: 55_000,
      coverAssetKey: "landing/gallery/portrait/gallery-portrait-outdoor",
      category: "portrait" as const,
      duration: "1hr",
      depositPercent: 25,
      isActive: true,
      totalRevenue: 420_000,
      metadata: {
        badges: ["public", "new"],
        photographers: 1,
        locationType: "outdoor",
        editedPhotos: 15,
        revisions: 1,
        onlineGallery: true,
        includes: ["Outdoor session", "15 edited photos", "Private online gallery"],
        additionalNotes: "Perfect for families with young children.",
      },
    },
  ];

  for (const seedPkg of ERIC_SERVICE_PACKAGES) {
    await prisma.servicePackage.upsert({
      where: { id: seedPkg.id },
      update: {
        studioId: ericStudio.id,
        title: seedPkg.title,
        description: seedPkg.description,
        price: seedPkg.price,
        coverAssetKey: seedPkg.coverAssetKey,
        category: seedPkg.category,
        duration: seedPkg.duration,
        depositPercent: seedPkg.depositPercent,
        isActive: seedPkg.isActive,
        totalRevenue: seedPkg.totalRevenue,
        metadata: seedPkg.metadata,
      },
      create: {
        id: seedPkg.id,
        studioId: ericStudio.id,
        title: seedPkg.title,
        description: seedPkg.description,
        price: seedPkg.price,
        coverAssetKey: seedPkg.coverAssetKey,
        category: seedPkg.category,
        duration: seedPkg.duration,
        depositPercent: seedPkg.depositPercent,
        isActive: seedPkg.isActive,
        totalRevenue: seedPkg.totalRevenue,
        metadata: seedPkg.metadata,
      },
    });
  }

  console.log(`Seeded Eric service packages: ${ERIC_SERVICE_PACKAGES.length}`);

  const BOOKING_SEEDS = [
    {
      reference: "BK-7742",
      clientEmail: "immaculee.niyonsaba@gmail.com",
      packageName: "Premium Wedding Package",
      packageDetail: "Full Day + Album",
      packagePrice: 650_000,
      sessionAt: new Date("2026-06-28T10:00:00"),
      sessionDateLabel: "Jun 28, 2026",
      sessionTime: "10:00 AM",
      timeWindow: "10:00 AM - 6:00 PM (8 Hours)",
      venue: "Kigali Convention Centre, Main Hall",
      status: "confirmed" as const,
      paymentStatus: "partial" as const,
      detailStatus: "pendingVerification",
      amountPaid: 325_000,
      showVerifyPayment: true,
      progressStep: 2,
      galleryStep: 1,
      paymentMeta: {
        statusLabel: "Partial Payment Received (RWF 325,000 Deposit)",
        receiptAssetKey: "photographer/booking-receipt-preview",
        amountPaid: 325_000,
        transactionRef: "BK-7742-XP",
        paymentDate: "Jun 12, 2026",
        verificationStatus: "pending",
        note: "MoMo receipt uploaded — awaiting studio verification.",
      },
      timeline: [
        { id: "1", title: "Booking Requested", timestamp: "Jun 10, 2026 • 09:14 AM", state: "completed" },
        { id: "2", title: "Package Selected", timestamp: "Jun 10, 2026 • 09:45 AM", state: "completed" },
        { id: "3", title: "Receipt Uploaded", timestamp: "Jun 12, 2026 • 02:30 PM", state: "completed", note: "Here is the MoMo slip for the 50% deposit. Thank you!" },
        { id: "4", title: "Awaiting Verification", timestamp: "Current Status", state: "current" },
        { id: "5", title: "Confirmed", timestamp: "Upcoming", state: "upcoming" },
      ],
      depositRequest: { amount: 325_000, status: "pending" as const },
    },
    {
      reference: "BK-7743",
      clientEmail: "jb.mugisha@kigaliagency.rw",
      packageName: "Editorial Portrait Session",
      packageDetail: "4 Hours Studio",
      packagePrice: 340_000,
      sessionAt: new Date("2026-07-02T14:00:00"),
      sessionDateLabel: "Jul 02, 2026",
      sessionTime: "02:00 PM",
      status: "pending" as const,
      paymentStatus: "partial" as const,
      detailStatus: "pending",
      amountPaid: 170_000,
      progressStep: 1,
      paymentMeta: {
        statusLabel: "Partial Payment Received (RWF 170,000 Deposit)",
        receiptAssetKey: "photographer/booking-receipt-preview",
        amountPaid: 170_000,
        transactionRef: "BK-7743-XP",
        paymentDate: "Jun 18, 2026",
        verificationStatus: "pending",
      },
      depositRequest: { amount: 170_000, status: "unpaid" as const },
    },
    {
      reference: "BK-7744",
      clientEmail: "grace.uwera@gmail.com",
      packageName: "Family Legacy Shoot",
      packageDetail: "Outdoor Location",
      packagePrice: 65_000,
      sessionAt: new Date("2026-05-01T16:30:00"),
      sessionDateLabel: "May 01, 2026",
      sessionTime: "04:30 PM",
      status: "completed" as const,
      paymentStatus: "paid" as const,
      detailStatus: "completed",
      amountPaid: 65_000,
      progressStep: 5,
      galleryStep: 2,
      paymentMeta: {
        statusLabel: "Full Payment Received",
        receiptAssetKey: "photographer/booking-receipt-preview",
        amountPaid: 65_000,
        transactionRef: "BK-7744-XP",
        paymentDate: "May 01, 2026",
        verificationStatus: "verified",
      },
    },
    {
      reference: "BK-7745",
      clientEmail: "patrick.nkurunziza@studio.rw",
      packageName: "Headshot Mini-Session",
      packageDetail: "In-Studio Express",
      packagePrice: 65_000,
      sessionAt: new Date("2026-06-18T09:00:00"),
      sessionDateLabel: "Jun 18, 2026",
      sessionTime: "09:00 AM",
      status: "pending" as const,
      paymentStatus: "unpaid" as const,
      detailStatus: "pending",
      amountPaid: 0,
      progressStep: 0,
      paymentMeta: {
        statusLabel: "Deposit Required (50%)",
        receiptAssetKey: "photographer/booking-receipt-preview",
        amountPaid: 0,
        transactionRef: "—",
        paymentDate: "—",
        verificationStatus: "pending",
        note: "Pay your deposit via MoMo to confirm your session slot.",
      },
      depositRequest: { amount: 32_500, status: "unpaid" as const },
    },
  ];

  for (const seed of BOOKING_SEEDS) {
    const clientId = clientsByEmail.get(seed.clientEmail);
    const crmClient = await prisma.studioClient.findFirst({
      where: { studioId: studio.id, email: seed.clientEmail },
    });
    const clientUserId =
      seed.clientEmail.toLowerCase() === "immaculee.niyonsaba@gmail.com"
        ? immaculeeUserId ?? null
        : null;

    const booking = await prisma.booking.upsert({
      where: { reference: seed.reference },
      update: {
        clientId: clientId ?? null,
        clientUserId,
        clientName: crmClient?.name ?? "Client",
        clientEmail: seed.clientEmail,
        clientAvatarAssetKey: crmClient?.avatarAssetKey,
        packageName: seed.packageName,
        packageDetail: seed.packageDetail,
        packagePrice: seed.packagePrice,
        sessionAt: seed.sessionAt,
        sessionDateLabel: seed.sessionDateLabel,
        sessionTime: seed.sessionTime,
        timeWindow: seed.timeWindow,
        venue: seed.venue,
        city: "Kigali, Rwanda",
        status: seed.status,
        paymentStatus: seed.paymentStatus,
        detailStatus: seed.detailStatus,
        amountPaid: seed.amountPaid,
        showVerifyPayment: seed.showVerifyPayment ?? false,
        progressStep: seed.progressStep,
        galleryStep: seed.galleryStep,
        paymentMeta: seed.paymentMeta,
        timeline: seed.timeline,
        clientMeta: {
          phone: crmClient?.phone,
          preferredSince: crmClient?.memberSince.getFullYear() ?? 2023,
        },
        packageIncludes: [
          "Professional photographer",
          seed.packageDetail,
          "Edited digital gallery",
        ],
      },
      create: {
        studioId: studio.id,
        clientId: clientId ?? null,
        clientUserId,
        reference: seed.reference,
        clientName: crmClient?.name ?? "Client",
        clientEmail: seed.clientEmail,
        clientAvatarAssetKey: crmClient?.avatarAssetKey,
        packageName: seed.packageName,
        packageDetail: seed.packageDetail,
        packagePrice: seed.packagePrice,
        sessionAt: seed.sessionAt,
        sessionDateLabel: seed.sessionDateLabel,
        sessionTime: seed.sessionTime,
        timeWindow: seed.timeWindow,
        venue: seed.venue,
        city: "Kigali, Rwanda",
        status: seed.status,
        paymentStatus: seed.paymentStatus,
        detailStatus: seed.detailStatus,
        amountPaid: seed.amountPaid,
        showVerifyPayment: seed.showVerifyPayment ?? false,
        progressStep: seed.progressStep,
        galleryStep: seed.galleryStep,
        paymentMeta: seed.paymentMeta,
        timeline: seed.timeline,
        clientMeta: {
          phone: crmClient?.phone,
          preferredSince: crmClient?.memberSince.getFullYear() ?? 2023,
        },
        packageIncludes: [
          "Professional photographer",
          seed.packageDetail,
          "Edited digital gallery",
        ],
        requestedAt: new Date("2026-06-10T09:00:00"),
      },
    });

    if (seed.depositRequest) {
      await prisma.paymentRequest.upsert({
        where: { id: `seed-pr-${booking.reference}` },
        update: {
          bookingId: booking.id,
          studioId: studio.id,
          type: "deposit",
          amount: seed.depositRequest.amount,
          status: seed.depositRequest.status,
          dueDate: seed.sessionAt,
          invoiceRef: `INV-2026-${booking.reference.replace("BK-", "")}`,
          bookingReference: booking.reference,
          bookingTitle: seed.packageName,
        },
        create: {
          id: `seed-pr-${booking.reference}`,
          bookingId: booking.id,
          studioId: studio.id,
          type: "deposit",
          amount: seed.depositRequest.amount,
          status: seed.depositRequest.status,
          dueDate: seed.sessionAt,
          invoiceRef: `INV-2026-${booking.reference.replace("BK-", "")}`,
          bookingReference: booking.reference,
          bookingTitle: seed.packageName,
        },
      });
    }
  }

  const bk7742 = await prisma.booking.findUnique({ where: { reference: "BK-7742" } });
  if (bk7742) {
    const depositRequest = await prisma.paymentRequest.findUnique({
      where: { id: "seed-pr-BK-7742" },
    });

    if (depositRequest) {
      await prisma.paymentVerification.upsert({
        where: { id: "seed-verification-BK-7742" },
        update: {
          paymentRequestId: depositRequest.id,
          bookingId: bk7742.id,
          studioId: studio.id,
          clientName: "Immaculée Niyonsaba",
          clientEmail: "immaculee.niyonsaba@gmail.com",
          clientAvatarAssetKey: "landing/testimonials/testimonial-sarah-jenkins-avatar",
          transactionId: "TXN-009120-IN",
          bookingTitle: "Premium Wedding Package",
          packageName: "Premium Wedding Package",
          bookingDate: "Jun 12, 2026",
          amount: 325_000,
          receiptAssetKey: "photographer/booking-receipt-preview",
          status: "pending",
          highPriority: true,
          submittedAt: new Date("2026-06-12T14:30:00"),
        },
        create: {
          id: "seed-verification-BK-7742",
          paymentRequestId: depositRequest.id,
          bookingId: bk7742.id,
          studioId: studio.id,
          clientName: "Immaculée Niyonsaba",
          clientEmail: "immaculee.niyonsaba@gmail.com",
          clientAvatarAssetKey: "landing/testimonials/testimonial-sarah-jenkins-avatar",
          transactionId: "TXN-009120-IN",
          bookingTitle: "Premium Wedding Package",
          packageName: "Premium Wedding Package",
          bookingDate: "Jun 12, 2026",
          amount: 325_000,
          receiptAssetKey: "photographer/booking-receipt-preview",
          status: "pending",
          highPriority: true,
          submittedAt: new Date("2026-06-12T14:30:00"),
        },
      });
    }

    await prisma.paymentRequest.upsert({
      where: { id: "seed-pr-balance-BK-7742" },
      update: {
        bookingId: bk7742.id,
        studioId: studio.id,
        type: "balance",
        amount: 325_000,
        status: "unpaid",
        dueDate: new Date("2026-06-30T00:00:00"),
        invoiceRef: "INV-2026-089",
        bookingReference: "BK-7742",
        bookingTitle: "Premium Wedding Session",
      },
      create: {
        id: "seed-pr-balance-BK-7742",
        bookingId: bk7742.id,
        studioId: studio.id,
        type: "balance",
        amount: 325_000,
        status: "unpaid",
        dueDate: new Date("2026-06-30T00:00:00"),
        invoiceRef: "INV-2026-089",
        bookingReference: "BK-7742",
        bookingTitle: "Premium Wedding Session",
      },
    });

    const HISTORY_RECORDS = [
      {
        id: "seed-record-immaculee-1",
        bookingTitle: "Family Portrait Session",
        amount: 85_000,
        paidAt: new Date("2026-05-10T10:00:00"),
        status: "approved" as const,
      },
      {
        id: "seed-record-immaculee-2",
        bookingTitle: "Engagement Mini Session",
        amount: 120_000,
        paidAt: new Date("2026-03-02T14:00:00"),
        status: "approved" as const,
      },
    ];

    for (const record of HISTORY_RECORDS) {
      await prisma.paymentRecord.upsert({
        where: { id: record.id },
        update: {
          clientEmail: "immaculee.niyonsaba@gmail.com",
          bookingId: bk7742.id,
          studioId: studio.id,
          studioName: studio.name,
          bookingTitle: record.bookingTitle,
          amount: record.amount,
          paidAt: record.paidAt,
          status: record.status,
          receiptAssetKey: "photographer/booking-receipt-preview",
        },
        create: {
          id: record.id,
          clientEmail: "immaculee.niyonsaba@gmail.com",
          bookingId: bk7742.id,
          studioId: studio.id,
          studioName: studio.name,
          bookingTitle: record.bookingTitle,
          amount: record.amount,
          paidAt: record.paidAt,
          status: record.status,
          receiptAssetKey: "photographer/booking-receipt-preview",
        },
      });
    }
  }

  const bk7744 = await prisma.booking.findUnique({ where: { reference: "BK-7744" } });
  if (bk7744) {
    await prisma.paymentRecord.upsert({
      where: { id: "seed-record-grace-7744" },
      update: {
        clientEmail: "grace.uwera@gmail.com",
        bookingId: bk7744.id,
        studioId: studio.id,
        studioName: studio.name,
        bookingTitle: "Family Legacy Shoot",
        amount: 65_000,
        paidAt: new Date("2026-05-01T16:30:00"),
        status: "approved",
        receiptAssetKey: "photographer/booking-receipt-preview",
      },
      create: {
        id: "seed-record-grace-7744",
        clientEmail: "grace.uwera@gmail.com",
        bookingId: bk7744.id,
        studioId: studio.id,
        studioName: studio.name,
        bookingTitle: "Family Legacy Shoot",
        amount: 65_000,
        paidAt: new Date("2026-05-01T16:30:00"),
        status: "approved",
        receiptAssetKey: "photographer/booking-receipt-preview",
      },
    });
  }

  console.log("Seeded demo users:");
  for (const demoUser of DEMO_USERS) {
    console.log(`  - ${demoUser.fullName} <${demoUser.email}> (${demoUser.role})`);
  }
  console.log(`  Password for all demo accounts: ${DEMO_PASSWORD}`);
  console.log(`Seeded studio: ${studio.name}`);
  console.log(`Seeded CRM clients: ${CRM_CLIENTS.length}`);
  console.log(`Seeded bookings: ${BOOKING_SEEDS.length}`);
  console.log("Seeded payment verifications and records");

  const immaculeeClient = await prisma.studioClient.findFirst({
    where: { studioId: studio.id, email: "immaculee.niyonsaba@gmail.com" },
  });
  const jeanBaptisteClient = await prisma.studioClient.findFirst({
    where: { studioId: studio.id, email: "jb.mugisha@kigaliagency.rw" },
  });

  const WEDDING_PHOTO_KEYS = [
    "landing/gallery/wedding/gallery-wedding-couple",
    "landing/gallery/wedding/gallery-wedding-celebration",
    "landing/gallery/wedding/gallery-wedding-event",
    "landing/gallery/wedding/gallery-wedding-headshot",
    "landing/gallery/portrait/gallery-portrait-outdoor",
    "landing/gallery/portrait/gallery-portrait-studio",
    "landing/gallery/graduation/gallery-graduation-campus",
    "landing/gallery/graduation/gallery-graduation-cap-gown",
  ];

  const PORTRAIT_PHOTO_KEYS = [
    "landing/gallery/portrait/gallery-portrait-outdoor",
    "landing/gallery/portrait/gallery-portrait-headshot",
    "landing/gallery/portrait/gallery-portrait-creative",
    "landing/gallery/portrait/gallery-portrait-fashion",
    "landing/gallery/portrait/gallery-portrait-studio",
    "landing/gallery/wedding/gallery-wedding-headshot",
  ];

  async function seedGalleryPhotos(galleryId: string, keys: string[], title: string) {
    await prisma.galleryPhoto.deleteMany({ where: { galleryId } });
    await prisma.galleryPhoto.createMany({
      data: keys.map((assetKey, index) => ({
        galleryId,
        assetKey,
        alt: `${title} photo ${index + 1}`,
        sortOrder: index,
      })),
    });
  }

  if (bk7742 && immaculeeClient) {
    const niyonsabaGallery = await prisma.gallery.upsert({
      where: { id: "seed-gallery-niyonsaba-wedding" },
      update: {
        studioId: studio.id,
        clientId: immaculeeClient.id,
        clientUserId: immaculeeUserId ?? null,
        title: "Niyonsaba Wedding",
        description: "Engagement and wedding highlights for Immaculée Niyonsaba.",
        category: "wedding",
        status: "published",
        workflowStatus: "delivered",
        coverAssetKey: "landing/gallery/wedding/gallery-wedding-couple",
        photoCount: WEDDING_PHOTO_KEYS.length,
        views: 2104,
        downloads: 142,
        likes: 489,
        clientName: immaculeeClient.name,
        clientEmail: immaculeeClient.email,
        shootDate: "May 22, 2026",
        location: "Serena Hotel, Kigali",
        storageUsedGb: 4.8,
        storageTotalGb: 10,
        isNew: true,
        uploadedAt: new Date("2026-05-15T10:00:00"),
        delivery: {
          accessPin: "4827",
          expiresAt: "June 30, 2026",
          deliveryNotes:
            "Full gallery delivered. Client has download access until the expiration date.",
        },
        activities: [
          {
            id: "1",
            type: "view",
            description: "Gallery viewed by 14 guests via public link",
            timestamp: "1 hour ago",
          },
          {
            id: "2",
            type: "download",
            description: "Immaculée N. downloaded 28 photos",
            timestamp: "Yesterday",
          },
        ],
      },
      create: {
        id: "seed-gallery-niyonsaba-wedding",
        studioId: studio.id,
        clientId: immaculeeClient.id,
        clientUserId: immaculeeUserId ?? null,
        title: "Niyonsaba Wedding",
        description: "Engagement and wedding highlights for Immaculée Niyonsaba.",
        category: "wedding",
        status: "published",
        workflowStatus: "delivered",
        coverAssetKey: "landing/gallery/wedding/gallery-wedding-couple",
        photoCount: WEDDING_PHOTO_KEYS.length,
        views: 2104,
        downloads: 142,
        likes: 489,
        clientName: immaculeeClient.name,
        clientEmail: immaculeeClient.email,
        shootDate: "May 22, 2026",
        location: "Serena Hotel, Kigali",
        storageUsedGb: 4.8,
        storageTotalGb: 10,
        isNew: true,
        uploadedAt: new Date("2026-05-15T10:00:00"),
        delivery: {
          accessPin: "4827",
          expiresAt: "June 30, 2026",
        },
        activities: [
          {
            id: "1",
            type: "view",
            description: "Gallery viewed by 14 guests via public link",
            timestamp: "1 hour ago",
          },
        ],
      },
    });

    await seedGalleryPhotos(
      niyonsabaGallery.id,
      WEDDING_PHOTO_KEYS,
      niyonsabaGallery.title,
    );

    await prisma.booking.update({
      where: { id: bk7742.id },
      data: { galleryId: niyonsabaGallery.id, galleryStep: 3 },
    });

    const portraitGallery = await prisma.gallery.upsert({
      where: { id: "seed-gallery-immaculee-portrait" },
      update: {
        studioId: studio.id,
        clientId: immaculeeClient.id,
        clientUserId: immaculeeUserId ?? null,
        title: "Modern Minimalist Portrait",
        category: "portrait",
        status: "published",
        workflowStatus: "delivered",
        coverAssetKey: "landing/gallery/portrait/gallery-portrait-outdoor",
        photoCount: PORTRAIT_PHOTO_KEYS.length,
        views: 312,
        downloads: 18,
        likes: 64,
        clientName: immaculeeClient.name,
        clientEmail: immaculeeClient.email,
        shootDate: "Apr 02, 2026",
        location: "Kigali, Rwanda",
        storageUsedGb: 1.2,
        uploadedAt: new Date("2026-04-02T14:00:00"),
      },
      create: {
        id: "seed-gallery-immaculee-portrait",
        studioId: studio.id,
        clientId: immaculeeClient.id,
        clientUserId: immaculeeUserId ?? null,
        title: "Modern Minimalist Portrait",
        category: "portrait",
        status: "published",
        workflowStatus: "delivered",
        coverAssetKey: "landing/gallery/portrait/gallery-portrait-outdoor",
        photoCount: PORTRAIT_PHOTO_KEYS.length,
        views: 312,
        downloads: 18,
        likes: 64,
        clientName: immaculeeClient.name,
        clientEmail: immaculeeClient.email,
        shootDate: "Apr 02, 2026",
        location: "Kigali, Rwanda",
        storageUsedGb: 1.2,
        uploadedAt: new Date("2026-04-02T14:00:00"),
      },
    });

    await seedGalleryPhotos(
      portraitGallery.id,
      PORTRAIT_PHOTO_KEYS,
      portraitGallery.title,
    );
  }

  const bk7743 = await prisma.booking.findUnique({ where: { reference: "BK-7743" } });
  if (bk7743 && jeanBaptisteClient) {
    const mugishaGallery = await prisma.gallery.upsert({
      where: { id: "seed-gallery-mugisha-wedding" },
      update: {
        studioId: studio.id,
        clientId: jeanBaptisteClient.id,
        title: "Mugisha Wedding",
        description: "Full wedding coverage for Jean-Baptiste Mugisha.",
        category: "wedding",
        status: "published",
        workflowStatus: "editing",
        coverAssetKey: "landing/gallery/wedding/gallery-wedding-event",
        photoCount: 6,
        views: 1240,
        downloads: 86,
        likes: 312,
        clientName: jeanBaptisteClient.name,
        clientEmail: jeanBaptisteClient.email,
        shootDate: "June 14, 2026",
        location: "Kigali Convention Centre, Kigali",
        storageUsedGb: 1.5,
        uploadedAt: new Date("2026-05-22T09:00:00"),
      },
      create: {
        id: "seed-gallery-mugisha-wedding",
        studioId: studio.id,
        clientId: jeanBaptisteClient.id,
        title: "Mugisha Wedding",
        description: "Full wedding coverage for Jean-Baptiste Mugisha.",
        category: "wedding",
        status: "published",
        workflowStatus: "editing",
        coverAssetKey: "landing/gallery/wedding/gallery-wedding-event",
        photoCount: 6,
        views: 1240,
        downloads: 86,
        likes: 312,
        clientName: jeanBaptisteClient.name,
        clientEmail: jeanBaptisteClient.email,
        shootDate: "June 14, 2026",
        location: "Kigali Convention Centre, Kigali",
        storageUsedGb: 1.5,
        uploadedAt: new Date("2026-05-22T09:00:00"),
      },
    });

    await seedGalleryPhotos(
      mugishaGallery.id,
      WEDDING_PHOTO_KEYS.slice(0, 6),
      mugishaGallery.title,
    );

    await prisma.booking.update({
      where: { id: bk7743.id },
      data: { galleryId: mugishaGallery.id, galleryStep: 2 },
    });
  }

  console.log("Seeded galleries with photos");

  await seedNotifications(imaniUserId, immaculeeUserId);
}

async function seedNotifications(
  imaniUserId: string | undefined,
  immaculeeUserId: string | undefined,
) {
  if (!imaniUserId || !immaculeeUserId) return;

  await prisma.notification.deleteMany({
    where: { userId: { in: [imaniUserId, immaculeeUserId] } },
  });

  const bk7742 = await prisma.booking.findUnique({ where: { reference: "BK-7742" } });
  const bk7744 = await prisma.booking.findUnique({ where: { reference: "BK-7744" } });
  const mugishaGallery = await prisma.gallery.findUnique({
    where: { id: "seed-gallery-mugisha-wedding" },
  });
  const niyonsabaGallery = await prisma.gallery.findUnique({
    where: { id: "seed-gallery-niyonsaba-wedding" },
  });
  const portraitGallery = await prisma.gallery.findUnique({
    where: { id: "seed-gallery-immaculee-portrait" },
  });

  const now = Date.now();
  const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000);
  const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000);

  await prisma.notification.createMany({
    data: [
      {
        id: "seed-notif-imani-booking-1",
        userId: imaniUserId,
        category: "booking",
        title: "New Booking Request",
        description:
          "Immaculée Niyonsaba requested a Wedding Excellence session for June 28, 2026 at Kigali Convention Centre.",
        read: false,
        actionHref: bk7742 ? `/photographer/bookings/${bk7742.id}` : "/photographer/bookings",
        metadata: {
          icon: "calendar",
          priority: "high",
          primaryAction: {
            label: "View Booking",
            href: bk7742 ? `/photographer/bookings/${bk7742.id}` : "/photographer/bookings",
          },
          secondaryAction: { label: "Decline", variant: "link" },
        },
        createdAt: hoursAgo(2),
      },
      {
        id: "seed-notif-imani-payment-1",
        userId: imaniUserId,
        category: "payment",
        title: "Payment Received",
        description:
          "Jean-Baptiste Mugisha paid a deposit of RWF 225,000 for Editorial Portrait Session.",
        read: true,
        actionHref: "/photographer/payments",
        metadata: {
          icon: "payment",
          priority: "medium",
          primaryAction: { label: "Review Payment", href: "/photographer/payments" },
          secondaryAction: { label: "View Invoice", variant: "outline" },
        },
        createdAt: hoursAgo(5),
      },
      {
        id: "seed-notif-imani-gallery-1",
        userId: imaniUserId,
        category: "gallery",
        title: "Gallery Ready for Review",
        description:
          "The Mugisha Wedding gallery is ready for client delivery. Jean-Baptiste Mugisha has been notified.",
        read: true,
        actionHref: mugishaGallery
          ? `/photographer/galleries/${mugishaGallery.id}`
          : "/photographer/galleries",
        metadata: {
          icon: "gallery",
          priority: "low",
          primaryAction: {
            label: "View Gallery",
            href: mugishaGallery
              ? `/photographer/galleries/${mugishaGallery.id}`
              : "/photographer/galleries",
          },
          secondaryAction: { label: "Share Link", variant: "outline" },
        },
        createdAt: daysAgo(1),
      },
      {
        id: "seed-notif-imani-client-1",
        userId: imaniUserId,
        category: "client",
        title: "Client Favorited Photos",
        description:
          "Grace Uwera favorited 12 photos in the Editorial Portrait Series gallery.",
        read: true,
        actionHref: "/photographer/galleries",
        metadata: {
          icon: "client",
          priority: "medium",
          primaryAction: { label: "View Activity", href: "/photographer/galleries" },
        },
        createdAt: daysAgo(1),
      },
      {
        id: "seed-notif-imani-system-1",
        userId: imaniUserId,
        category: "system",
        title: "Storage Limit Warning",
        description:
          "You have used 42 GB of your 100 GB storage plan. Upgrade to avoid upload interruptions.",
        read: false,
        actionHref: "/photographer/settings",
        metadata: {
          icon: "alert",
          priority: "high",
          primaryAction: { label: "Upgrade Storage", href: "/photographer/settings" },
          secondaryAction: {
            label: "View Analytics",
            href: "/photographer/analytics",
            variant: "outline",
          },
        },
        createdAt: daysAgo(3),
      },
      {
        id: "seed-notif-imani-booking-2",
        userId: imaniUserId,
        category: "booking",
        title: "Booking Confirmed",
        description:
          "Patrick Nkurunziza's Commercial Lifestyle session on July 3, 2026 has been confirmed.",
        read: true,
        actionHref: bk7744 ? `/photographer/bookings/${bk7744.id}` : "/photographer/bookings",
        metadata: {
          icon: "calendar",
          priority: "low",
          primaryAction: {
            label: "View Booking",
            href: bk7744 ? `/photographer/bookings/${bk7744.id}` : "/photographer/bookings",
          },
        },
        createdAt: daysAgo(4),
      },
      {
        id: "seed-notif-client-payment-1",
        userId: immaculeeUserId,
        category: "payment",
        title: "Payment verification in progress",
        description: "RWF 325,000 for Premium Wedding Session.",
        read: false,
        actionHref: "/client/payments",
        metadata: { actionLabel: "viewDetails" },
        createdAt: hoursAgo(2),
      },
      {
        id: "seed-notif-client-gallery-1",
        userId: immaculeeUserId,
        category: "gallery",
        title: "New photos added",
        description: `Niyonsaba Wedding · ${niyonsabaGallery?.photoCount ?? 8} photos ready to view.`,
        read: false,
        actionHref: niyonsabaGallery
          ? `/client/galleries/${niyonsabaGallery.id}`
          : "/client/galleries",
        metadata: { actionLabel: "viewDetails" },
        createdAt: hoursAgo(5),
      },
      {
        id: "seed-notif-client-gallery-2",
        userId: immaculeeUserId,
        category: "gallery",
        title: "New photos added",
        description: `Modern Minimalist Portrait · ${portraitGallery?.photoCount ?? 6} photos ready to view.`,
        read: true,
        actionHref: portraitGallery
          ? `/client/galleries/${portraitGallery.id}`
          : "/client/galleries",
        metadata: { actionLabel: "viewDetails" },
        createdAt: daysAgo(1),
      },
      {
        id: "seed-notif-client-welcome-1",
        userId: immaculeeUserId,
        category: "general",
        title: "Welcome to Shutterdesk",
        description: "Hi Immaculée, your client portal is ready.",
        read: true,
        actionHref: "/client/dashboard",
        metadata: { actionLabel: "getStarted" },
        createdAt: daysAgo(2),
      },
    ],
  });

  console.log("Seeded notifications");
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
