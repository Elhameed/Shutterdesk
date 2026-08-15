import { useParams } from "react-router-dom";
import { ClientBookingDetailView } from "@/features/client-booking-detail";

export function ClientBookingDetailPage() {
  const { id = "" } = useParams();
  return <ClientBookingDetailView bookingId={id} />;
}
