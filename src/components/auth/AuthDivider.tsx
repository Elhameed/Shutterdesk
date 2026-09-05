type AuthDividerProps = {
  label?: string;
};

export function AuthDivider({ label = "or" }: AuthDividerProps) {
  return (
    <div className="relative my-8">
      <div className="absolute inset-0 flex items-center" aria-hidden>
        <div className="border-border w-full border-t" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-paper text-ink-faint px-4 text-xs">
          {label}
        </span>
      </div>
    </div>
  );
}
