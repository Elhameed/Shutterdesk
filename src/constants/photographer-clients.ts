export const CLIENTS_COPY = {
  title: "Client Management",
  subtitle:
    "Manage your client relationships, booking history, payments, and galleries.",
  cardView: "Card View",
  listView: "List",
  addClient: "Add Client",
  filters: "Filters",
  clientType: "Client Type",
  clientStatus: "Client Status",
  dateAdded: "Date Added",
  reset: "Reset",
  searchPlaceholder: "Search clients...",
  sessions: "Sessions",
  totalRevenue: "Total Revenue",
  balance: "Balance",
  lastBooking: "Last Booking",
  health: "Health",
  actions: "Actions",
  viewClient: "View Client",
  viewGalleryAction: "View Gallery",
  moreActions: "More Actions",
  healthy: "Healthy",
  atRisk: "At Risk",
  revenue: "Revenue",
  columns: {
    client: "Client",
    category: "Category",
    sessions: "Sessions",
    totalRevenue: "Total Revenue",
    balance: "Balance",
    lastBooking: "Last Booking",
    status: "Status",
    health: "Health",
    actions: "Actions",
  },
  viewProfile: "View Profile",
  viewPayments: "View Payments",
  viewGallery: "View Gallery",
  noGalleriesForClientTitle: "No galleries yet",
  noGalleriesForClient: "This client doesn't have any galleries yet.",
  moreActionsMenu: {
    viewProfile: "View Profile",
    viewGalleries: "View Galleries",
    viewBookingHistory: "View Booking History",
    createGallery: "Create Gallery",
    viewPayments: "View Payments",
    sendMessage: "Send Message",
  },
  showing: (from: number, to: number, total: number) =>
    `Showing ${from}-${to} of ${total} clients`,
  status: {
    vip: "VIP",
    active: "Active",
    new: "New",
  },
  categories: {
    wedding: "Wedding",
    commercial: "Commercial",
    portrait: "Portrait",
    editorial: "Editorial",
  },
} as const;

export type ClientViewMode = "card" | "list";

export type ClientStatusFilter = "all" | "vip" | "active" | "new";
export type ClientTypeFilter =
  | "all"
  | "wedding"
  | "commercial"
  | "portrait"
  | "editorial";
