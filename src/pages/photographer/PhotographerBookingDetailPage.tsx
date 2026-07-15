import { useParams } from "react-router-dom";
import { BookingDetailView } from "@/features/photographer-booking-detail";

export function PhotographerBookingDetailPage() {
  const { id = "" } = useParams<{ id: string }>();

  return <BookingDetailView bookingId={id} />;
}
