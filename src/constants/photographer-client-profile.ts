export const CLIENT_PROFILE_COPY = {
  breadcrumbClients: "Clients",
  quickCall: "Quick call",
  sendMessage: "Send message",
  financialSummary: "Financial summary",
  totalRevenue: "Total revenue",
  balance: "Balance",
  sessions: "Sessions",
  reliability: "Reliability",
  memberSince: (date: string) => `Member since ${date}`,
  insights: "Insights",
  retention: "Retention",
  favType: "Fav type",
  avgValue: "Avg value",
  createBooking: "Create booking",
  requestPayment: "Request payment",
  shareGallery: "Share gallery",
  tabs: {
    timeline: "Timeline",
    projects: "Projects",
    invoices: "Invoices",
    galleries: "Galleries",
  },
  preferences: "Preferences",
  primaryContact: "Primary contact",
  artisticStyle: "Artistic style",
  editingPrefs: "Editing prefs",
  specialRequirements: "Special requirements",
  internalMemo: "Internal memo",
  memoPlaceholder: "Add private notes...",
  save: "Save",
  memoSaved: "Notes saved",
  memoSaveFailed: "Unable to save notes",
  notFound: "Client not found",
  backToClients: "Back to clients",
  excellent: "Excellent",
  emailOnly: "Email only",
  deliveredGalleries: "Delivered galleries",
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
