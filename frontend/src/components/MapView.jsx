// Static map placeholder with issue markers
import { MapPin, Plus, Minus, Crosshair } from 'lucide-react';

const categoryColors = {
  Potholes: '#f59e0b',
  Sanitation: '#10b981',
  Streetlights: '#6366f1',
  Drainage: '#3b82f6',
  Water: '#0ea5e9',
  'Road Damage': '#ef4444',
  Other: '#8b5cf6',
};

export default function MapView({ issues = [], selectedId = null, onSelect, height = '240px', className = '' }) {
  const handleMarkerClick = (issue) => {
    if (onSelect) onSelect(issue);
  };

  return (
    <div
      className={`relative rounded-2xl overflow-hidden ${className}`}
      style={{ height }}
    >
      {/* Map background */}
      <div className="absolute inset-0 map-pattern" />

      {/* Road overlays (visual) */}
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.4 }}>
        {/* Horizontal roads */}
        <line x1="0" y1="40%" x2="100%" y2="40%" stroke="#d1d5db" strokeWidth="12" />
        <line x1="0" y1="65%" x2="100%" y2="65%" stroke="#e5e7eb" strokeWidth="8" />
        <line x1="0" y1="25%" x2="100%" y2="25%" stroke="#e5e7eb" strokeWidth="6" />
        {/* Vertical roads */}
        <line x1="30%" y1="0" x2="30%" y2="100%" stroke="#d1d5db" strokeWidth="10" />
        <line x1="65%" y1="0" x2="65%" y2="100%" stroke="#e5e7eb" strokeWidth="8" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="#e5e7eb" strokeWidth="5" />
        {/* Diagonal */}
        <line x1="0" y1="80%" x2="40%" y2="50%" stroke="#e5e7eb" strokeWidth="6" />
        {/* Park area */}
        <rect x="55%" y="55%" width="20%" height="25%" fill="#bbf7d0" opacity="0.6" rx="4" />
        <text x="65%" y="70%" textAnchor="middle" fill="#16a34a" fontSize="8" fontWeight="600">Tower Park</text>
      </svg>

      {/* Road labels */}
      <div className="absolute top-[38%] left-2 text-[9px] text-gray-500 font-medium bg-white/70 px-1 rounded">
        ANNA SALAI ARTERIAL
      </div>
      <div className="absolute top-2 left-2 bg-white/90 text-xs font-semibold text-gray-700 px-2 py-1 rounded-lg shadow-sm border border-gray-200">
        Ward 104 • Zone 4
      </div>

      {/* Issue markers */}
      {issues.slice(0, 6).map((issue, index) => {
        const positions = [
          { top: '20%', left: '28%' },
          { top: '45%', left: '60%' },
          { top: '60%', left: '25%' },
          { top: '30%', left: '70%' },
          { top: '70%', left: '50%' },
          { top: '50%', left: '45%' },
        ];
        const pos = positions[index % positions.length];
        const color = categoryColors[issue.category] || '#6b7280';
        const isSelected = issue.id === selectedId;
        const isCritical = issue.priority === 'High';

        return (
          <button
            key={issue.id}
            onClick={() => handleMarkerClick(issue)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 active:scale-95"
            style={{ top: pos.top, left: pos.left }}
            aria-label={`Issue marker: ${issue.title}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md border-2 ${
                isSelected ? 'border-white scale-110 shadow-lg' : 'border-white/80'
              } ${isCritical ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: color }}
            >
              <MapPin size={14} className="text-white" />
            </div>
            {isCritical && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border border-white" />
            )}
          </button>
        );
      })}

      {/* Map controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        <button className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50">
          <Plus size={14} className="text-gray-600" />
        </button>
        <button className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50">
          <Minus size={14} className="text-gray-600" />
        </button>
      </div>
      <div className="absolute bottom-3 left-3">
        <button className="w-7 h-7 bg-white rounded-lg shadow flex items-center justify-center hover:bg-gray-50">
          <Crosshair size={14} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
