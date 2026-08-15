import { useParams } from "react-router-dom";
import { ClientProfileView } from "@/features/photographer-client-profile";

export function PhotographerClientProfilePage() {
  const { id = "" } = useParams<{ id: string }>();

  return <ClientProfileView clientId={id} />;
}
