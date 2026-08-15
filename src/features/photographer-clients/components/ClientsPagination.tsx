import { Pagination } from "@/components/common/Pagination";
import { CLIENTS_COPY } from "@/constants/photographer-clients";

type ClientsPaginationProps = {
  currentPage: number;
  totalPages: number;
  from: number;
  to: number;
  totalClients: number;
  onPageChange: (page: number) => void;
};

export function ClientsPagination({
  currentPage,
  totalPages,
  from,
  to,
  totalClients,
  onPageChange,
}: ClientsPaginationProps) {
  const copy = CLIENTS_COPY;

  return (
    <Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      summary={copy.showing(from, to, totalClients)}
      onPageChange={onPageChange}
    />
  );
}
