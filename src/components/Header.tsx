import { useState } from 'react';
import { LayoutGrid, Leaf, Menu, User, X } from 'lucide-react';
import { NavTab } from '../types/ecosort';

interface HeaderProps {
  activeTab: NavTab;
  onNavigate: (tab: NavTab) => void;
  ecoScore: number;
  userName: string;
}

const NAV_ITEMS: { id: NavTab; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'identify', label: 'Identify Waste' },
  { id: 'scan', label: 'Scan Waste' },
  { id: 'centres', label: 'Recycling Centres' },
  { id: 'activity', label: 'My Activity' },
  { id: 'challenges', label: 'Challenges' },
  { id: 'learn', label: 'Learn' },
];

export function Header({
  activeTab,
  onNavigate,
  ecoScore,
  userName,
}: HeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSelect = (tab: NavTab) => {
    onNavigate(tab);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-[#E3EAE5]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="flex items-center gap-2.5 text-left shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18432B] rounded-lg py-1 pr-1"
        >
          <span className="w-8 h-8 rounded-lg bg-[#18432B] text-white inline-flex items-center justify-center shrink-0">
            <Leaf className="w-4 h-4" />
          </span>
          <span className="text-[17px] font-bold tracking-tight text-[#14231A] whitespace-nowrap">
            EcoSort
          </span>
        </button>

        {/* Primary Nav Links */}
        <nav
          aria-label="Primary navigation"
          className="hidden lg:flex items-center gap-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`px-3 py-1.5 rounded-lg text-[13.5px] font-medium whitespace-nowrap shrink-0 transition-colors duration-75 cursor-pointer ${
                  isActive
                    ? 'bg-[#EAF3ED] text-[#18432B] font-semibold'
                    : 'text-[#4B5E53] hover:text-[#14231A] hover:bg-[#F3F6F4]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Zone: Dashboard + User Score */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => handleSelect('dashboard')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-semibold whitespace-nowrap shrink-0 border transition-colors duration-75 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-[#18432B] text-white border-[#18432B]'
                : 'bg-white text-[#14231A] border-[#D7E1DB] hover:border-[#18432B]/40 hover:bg-[#F7FAF8]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Dashboard</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelect('dashboard')}
            aria-label={`${userName}, Eco Score ${ecoScore} points`}
            className="hidden sm:inline-flex items-center gap-2 pl-2.5 pr-3 py-1.5 rounded-lg bg-[#F5F8F6] border border-[#E3EAE5] text-[13px] text-[#283B30] hover:border-[#18432B]/30 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-[#587062]" aria-hidden="true" />
            <span className="font-medium">{userName}</span>
            <span
              data-testid="header-eco-score"
              className="font-mono font-semibold text-[#18432B] tabular-nums"
            >
              {ecoScore}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[#D7E1DB] text-[#14231A] hover:bg-[#F3F6F4] cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden border-t border-[#E3EAE5] bg-white px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item.id)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#EAF3ED] text-[#18432B] font-semibold'
                    : 'text-[#4B5E53] hover:bg-[#F3F6F4]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
          <div className="pt-2 mt-2 border-t border-[#E3EAE5] flex items-center justify-between px-3 py-1 text-xs text-[#587062]">
            <span>{userName}</span>
            <span className="font-mono font-semibold text-[#18432B] tabular-nums">
              {ecoScore} pts
            </span>
          </div>
        </nav>
      )}
    </header>
  );
}
