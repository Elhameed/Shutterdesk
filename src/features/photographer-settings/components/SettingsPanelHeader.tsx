type SettingsPanelHeaderProps = {
  title: string;
  subtitle: string;
};

export function SettingsPanelHeader({
  title,
  subtitle,
}: SettingsPanelHeaderProps) {
  return (
    <div>
      <h2 className="text-lg font-bold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-ink-soft">{subtitle}</p>
    </div>
  );
}
