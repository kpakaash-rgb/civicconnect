import { Home, Compass, Plus, Activity, Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', icon: Home, label: 'Home', exact: true },
  { path: '/explore', icon: Compass, label: 'Explore' },
  { path: '/report', icon: Plus, label: null, isFab: true },
  { path: '/activity', icon: Activity, label: 'Activity' },
  { path: '/my-reports', icon: Menu, label: 'Menu' },
];

export default function BottomNav() {
  const location = useLocation();

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 pb-safe">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 h-16">
        {navItems.map((item) => {
          if (item.isFab) {
            return (
              <Link
                key={item.path}
                to={item.path}
                id="bottom-nav-report"
                className="flex items-center justify-center w-14 h-14 bg-green-600 rounded-full shadow-lg shadow-green-200 hover:bg-green-700 active:scale-95 transition-all duration-200 -mt-5"
                aria-label="Report an Issue"
              >
                <Plus size={26} className="text-white" strokeWidth={2.5} />
              </Link>
            );
          }

          const active = isActive(item);
          return (
            <Link
              key={item.path}
              to={item.path}
              id={`bottom-nav-${item.label?.toLowerCase()}`}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <item.icon
                size={22}
                strokeWidth={active ? 2.5 : 1.8}
                className={active ? 'text-green-600' : ''}
              />
              <span className={`text-[10px] font-medium ${active ? 'text-green-600' : 'text-gray-400'}`}>
                {item.label}
              </span>
              {active && (
                <span className="absolute bottom-1 w-1 h-1 bg-green-600 rounded-full" style={{ position: 'static', display: 'block', marginTop: '-2px' }} />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
