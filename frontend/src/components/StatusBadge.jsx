const statusConfig = {
  'Reported': {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
    label: 'Reported',
  },
  'Under Review': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
    label: 'Under Review',
  },
  'In Progress': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    label: 'In Progress',
  },
  'Resolved': {
    bg: 'bg-green-50',
    text: 'text-green-700',
    border: 'border-green-200',
    dot: 'bg-green-500',
    label: 'Resolved',
  },
  'Critical': {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
    dot: 'bg-red-500',
    label: 'CRITICAL',
  },
};

const priorityConfig = {
  'High': { bg: 'bg-red-100', text: 'text-red-700', label: 'HIGH' },
  'Medium': { bg: 'bg-amber-100', text: 'text-amber-700', label: 'MED' },
  'Low': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'LOW' },
};

export default function StatusBadge({ status, type = 'status', size = 'sm' }) {
  if (type === 'priority') {
    const cfg = priorityConfig[status] || priorityConfig['Medium'];
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${cfg.bg} ${cfg.text}`}>
        {cfg.label}
      </span>
    );
  }

  const cfg = statusConfig[status] || statusConfig['Reported'];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
