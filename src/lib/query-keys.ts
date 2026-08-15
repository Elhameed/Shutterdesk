export const queryKeys = {
  photographer: {
    dashboard: ["photographer", "dashboard"] as const,
    bookings: ["photographer", "bookings"] as const,
    galleries: ["photographer", "galleries"] as const,
    notifications: ["photographer", "notifications"] as const,
  },
  client: {
    dashboard: ["client", "dashboard"] as const,
    bookings: ["client", "bookings"] as const,
    galleries: ["client", "galleries"] as const,
    notifications: ["client", "notifications"] as const,
  },
} as const;
