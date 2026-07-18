import { CLIENT_BOOKINGS_COPY } from "@/constants/client-bookings";

type ClientVenueHeroCardProps = {
  venue: string;
  image: string;
};

export function ClientVenueHeroCard({ venue, image }: ClientVenueHeroCardProps) {
  const copy = CLIENT_BOOKINGS_COPY.detail;

  return (
    <section className="relative overflow-hidden rounded-xl shadow-card">
      <img
        src={image}
        alt={venue}
        className="aspect-[16/7] w-full object-cover sm:aspect-[2/1]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <span className="inline-flex rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase backdrop-blur-sm">
          {copy.primaryVenue}
        </span>
        <p className="mt-2 text-lg font-bold text-white sm:text-xl">
          {venue.split(",")[0]}
        </p>
      </div>
    </section>
  );
}
