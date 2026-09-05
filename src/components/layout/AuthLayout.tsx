import { Outlet } from "react-router-dom";

/** Full-screen layout for auth pages (login, register) — no marketing header/footer */
export function AuthLayout() {
  return (
    <div className="bg-paper min-h-screen">
      <Outlet />
    </div>
  );
}
