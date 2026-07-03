import { formatRwf } from "@/lib/currency";

export const SERVICES_COPY = {
  title: "Service Packages",
  subtitle:
    "Create, organize, and manage your photography offerings for clients.",
  filter: "Filter",
  sort: "Sort",
  addPackage: "Add Package",
  searchPlaceholder: "Search packages...",
  noPackagesFound: "No packages found for this search.",
  edit: "Edit",
  duplicate: "Duplicate",
  delete: "Delete",
  deleteConfirmTitle: "Delete service package?",
  deleteConfirmDescription: (title: string) =>
    `"${title}" will be permanently removed. Past bookings keep their saved package details.`,
  deleteSuccessTitle: "Package deleted",
  deleteSuccessDescription: (title: string) => `"${title}" has been removed.`,
  deleteErrorTitle: "Could not delete package",
  duplicateSuccessTitle: "Package duplicated",
  duplicateSuccessDescription: (title: string) =>
    `"${title}" was created as a draft. Edit it before publishing.`,
  duplicateErrorTitle: "Could not duplicate package",
  totalRevenue: "Total Revenue",
  badges: {
    popular: "Popular",
    public: "Public",
    new: "New",
    featured: "Featured",
    private: "Private",
    draft: "Draft",
    archived: "Archived",
  },
  priceDisplay: (price: number) => formatRwf(price),
  revenueDisplay: (amount: number) => formatRwf(amount),
} as const;
