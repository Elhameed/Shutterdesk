import { SearchField } from "@/components/photographer/SearchField";
import { BOOKINGS_COPY } from "@/constants/photographer-bookings";

type BookingsSearchProps = {
  value: string;
  onChange: (value: string) => void;
};

export function BookingsSearch({ value, onChange }: BookingsSearchProps) {
  return (
    <SearchField
      value={value}
      onChange={onChange}
      placeholder={BOOKINGS_COPY.searchPlaceholder}
    />
  );
}
