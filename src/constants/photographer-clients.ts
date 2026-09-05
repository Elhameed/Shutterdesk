export const CLIENTS_COPY = {
  title: "Client management",
  subtitle:
    "Manage your client relationships, booking history, payments, and galleries.",
  cardView: "Card view",
  listView: "List",
  addClient: "Add client",
  filters: "Filters",
  clientType: "Client type",
  clientStatus: "Client status",
  dateAdded: "Date added",
  reset: "Reset",
  searchPlaceholder: "Search clients...",
  sessions: "Sessions",
  totalRevenue: "Total revenue",
  balance: "Balance",
  lastBooking: "Last booking",
  health: "Health",
  actions: "Actions",
  viewClient: "View client",
  viewGalleryAction: "View gallery",
  moreActions: "More actions",
  healthy: "Healthy",
  atRisk: "At risk",
  revenue: "Revenue",
  columns: {
    client: "Client",
    category: "Category",
    sessions: "Sessions",
    totalRevenue: "Total revenue",
    balance: "Balance",
    lastBooking: "Last booking",
    status: "Status",
    health: "Health",
    actions: "Actions",
  },
  viewProfile: "View profile",
  viewPayments: "View payments",
  viewGallery: "View gallery",
  noGalleriesForClientTitle: "No galleries yet",
  noGalleriesForClient: "This client doesn't have any galleries yet.",
  moreActionsMenu: {
    viewProfile: "View profile",
    viewGalleries: "View galleries",
    viewBookingHistory: "View booking history",
    createGallery: "Create gallery",
    viewPayments: "View payments",
    sendMessage: "Send message",
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
