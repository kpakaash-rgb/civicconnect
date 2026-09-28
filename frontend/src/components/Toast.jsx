import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: { icon: CheckCircle, bg: 'bg-green-600', text: 'text-white' },
    error: { icon: AlertCircle, bg: 'bg-red-600', text: 'text-white' },
    info: { icon: Info, bg: 'bg-gray-800', text: 'text-white' },
  }[type] || { icon: Info, bg: 'bg-gray-800', text: 'text-white' };

  const Icon = config.icon;

  return (
    <div className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl ${config.bg} ${config.text} max-w-sm w-[calc(100%-2rem)] animate-in`}
      role="alert"
    >
      <Icon size={18} className="flex-shrink-0" />
      <p className="text-sm font-medium flex-1">{message}</p>
      <button onClick={onClose} className="opacity-80 hover:opacity-100 flex-shrink-0">
        <X size={16} />
      </button>
    </div>
  );
}
