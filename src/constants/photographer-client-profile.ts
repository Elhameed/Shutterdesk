export const CLIENT_PROFILE_COPY = {
  breadcrumbClients: "Clients",
  quickCall: "Quick Call",
  sendMessage: "Send Message",
  financialSummary: "Financial Summary",
  totalRevenue: "Total Revenue",
  balance: "Balance",
  sessions: "Sessions",
  reliability: "Reliability",
  memberSince: (date: string) => `Member since ${date}`,
  insights: "Insights",
  retention: "Retention",
  favType: "Fav Type",
  avgValue: "Avg Value",
  createBooking: "Create Booking",
  requestPayment: "Request Payment",
  shareGallery: "Share Gallery",
  tabs: {
    timeline: "Timeline",
    projects: "Projects",
    invoices: "Invoices",
    galleries: "Galleries",
  },
  preferences: "Preferences",
  primaryContact: "Primary Contact",
  artisticStyle: "Artistic Style",
  editingPrefs: "Editing Prefs",
  specialRequirements: "Special Requirements",
  internalMemo: "Internal Memo",
  memoPlaceholder: "Add private notes...",
  save: "Save",
  memoSaved: "Notes saved",
  memoSaveFailed: "Unable to save notes",
  notFound: "Client not found",
  backToClients: "Back to clients",
  excellent: "Excellent",
  emailOnly: "Email Only",
  deliveredGalleries: "Delivered Galleries",
  openGallery: "Open gallery",
  projectStatus: {
    completed: "Completed",
    upcoming: "Upcoming",
  },
  invoiceStatus: {
    paid: "Paid",
    pending: "Pending",
  },
  galleryPrivacy: {
    private: "Private",
    public: "Public",
  },
  items: (count: number) => `${count} items`,
  photos: (count: number) => `${count} Photos`,
  invoiceColumns: {
    number: "Invoice #",
    description: "Description",
    date: "Date",
    amount: "Amount",
    status: "Status",
  },
} as const;

export type ClientProfileTab =
  | "timeline"
  | "projects"
  | "invoices"
  | "galleries";
