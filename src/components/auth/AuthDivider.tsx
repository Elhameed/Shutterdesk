type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({ label = "OR" }: AuthDividerProps) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-white px-4 text-xs font-medium uppercase tracking-wider text-muted-light">
          {label}
        </span>
      </div>
    </div>
  );
}
