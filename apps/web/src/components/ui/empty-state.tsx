interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 px-6 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-white/60 mb-2">{title}</h3>
      {description && <p className="text-sm text-white/30 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  );
}
