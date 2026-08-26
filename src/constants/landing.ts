import {
  BarChart3,
  Bell,
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Images,
  Users,
  type LucideIcon,
} from "lucide-react";

export const LANDING_NAV = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;

export const HERO_TRUST_INDICATORS = [
  "No credit card required",
  "Built for photographers",
  "Used by photographers in Kigali",
] as const;

export type FeatureItem = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const PLATFORM_FEATURES: FeatureItem[] = [
  {
    title: "Booking Management",
    description:
      "Integrated booking engine that handles session types, deposits, and scheduling without the back-and-forth.",
    icon: CalendarPlus,
  },
  {
    title: "Availability Calendar",
    description:
      "Sync multiple calendars to prevent double bookings and manage your personal time effectively.",
    icon: Calendar,
  },
  {
    title: "Client CRM",
    description:
      "Centralized client records including session history, preference notes, and payment details.",
    icon: Users,
  },
  {
    title: "Payment Verification",
    description:
      "Instant invoice generation and automated payment tracking with secure Stripe integration.",
    icon: CheckCircle2,
  },
  {
    title: "Gallery Delivery",
    description:
      "Beautifully curated online galleries for clients to download high-res images and order prints.",
    icon: Images,
  },
  {
    title: "Automated Notifications",
    description:
      "Smart reminders for clients about upcoming sessions, pending payments, and gallery expiration.",
    icon: Bell,
  },
  {
    title: "Business Analytics",
    description:
      "Track bookings, payments, revenue, and client activity.",
    icon: BarChart3,
  },
];

export const WORKFLOW_LABEL = "Photographer Journey";

export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "Receive Booking",
    description: "Get notified when a client requests a session.",
  },
  {
    step: 2,
    title: "Approve Request",
    description: "Review details and confirm the booking.",
  },
  {
    step: 3,
    title: "Verify Payment",
    description: "Confirm deposit or full payment before the shoot.",
  },
  {
    step: 4,
    title: "Conduct Session",
    description: "Focus on the shoot while Shutterdesk handles the admin.",
  },
  {
    step: 5,
    title: "Deliver Gallery",
    description: "Upload, curate, and share photos with your client.",
  },
] as const;

export const EXCELLENCE_FEATURES = [
  {
    title: "Unified Photographer Dashboard",
    description:
      "Real-time revenue tracking and pending tasks at a glance.",
  },
  {
    title: "Advanced CRM Interface",
    description:
      "Manage client relationships with sophisticated filtering.",
  },
  {
    title: "Premium Gallery Management",
    description:
      "Curate and deliver shoots with editorial-grade layouts.",
  },
] as const;

export const PRICING_PLANS = [
  {
    name: "Starter",
    status: "Coming Soon",
    highlighted: false,
  },
  {
    name: "Professional",
    status: "Coming Soon",
    highlighted: true,
  },
  {
    name: "Studio",
    status: "Coming Soon",
    highlighted: false,
  },
] as const;

import { TESTIMONIAL_PHOTOGRAPHERS } from "@/mocks/personas";

export const TESTIMONIALS = [
  {
    quote:
      "Shutterdesk has completely transformed how I handle my client workflow. It's the first tool that feels as premium as my photography.",
    name: TESTIMONIAL_PHOTOGRAPHERS[0].name,
    role: TESTIMONIAL_PHOTOGRAPHERS[0].role,
    avatar: TESTIMONIAL_PHOTOGRAPHERS[0].avatar,
  },
  {
    quote:
      "The gallery delivery system is flawless. My clients love the experience, and the automated reminders save me hours of admin every week.",
    name: TESTIMONIAL_PHOTOGRAPHERS[1].name,
    role: TESTIMONIAL_PHOTOGRAPHERS[1].role,
    avatar: TESTIMONIAL_PHOTOGRAPHERS[1].avatar,
  },
] as const;

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Roadmap", href: "#" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Press", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
  resources: [
    { label: "Help Center", href: "#" },
    { label: "Guides", href: "#" },
    { label: "Community", href: "#" },
    { label: "API Docs", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
} as const;
