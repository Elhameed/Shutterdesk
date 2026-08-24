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
      <h2 className="text-lg font-bold text-charcoal">{title}</h2>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}
