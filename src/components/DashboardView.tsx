import { ArrowRight, Camera, MapPin, Recycle, Search } from 'lucide-react';
import { CATEGORY_META } from '../data/wasteData';
import { ActivityEntry, ChallengeItem, NavTab } from '../types/ecosort';
import { DashboardStats } from '../utils/ecoRules';
import { CategoryIcon } from './CategoryIcon';

interface DashboardViewProps {
  userName: string;
  stats: DashboardStats;
  activities: ActivityEntry[];
  challenges: ChallengeItem[];
  onNavigate: (tab: NavTab) => void;
}

export function DashboardView({
  userName,
  stats,
  activities,
  challenges,
  onNavigate,
}: DashboardViewProps) {
  const recentActivities = activities.slice(0, 4);
  const featuredChallenge =
    challenges.find((c) => c.id === 'chal-recycle-10') || challenges[0];
  const challengePct = featuredChallenge
    ? Math.min(
        100,
        Math.round((featuredChallenge.progress / featuredChallenge.target) * 100)
      )
    : 0;

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Dark Forest Green Personal Impact Hero Banner (Matches PDF Page 11) */}
      <section className="rounded-2xl bg-[#18432B] text-white p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-wider uppercase text-[#B8D4C2]">
            Personal Environmental Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold">
            Welcome, {userName}
          </h1>
          <p className="text-sm text-[#D6E6DC]">
            You have logged{' '}
            <span className="font-mono font-semibold text-white tabular-nums">
              {stats.totalItems}
            </span>{' '}
            responsible disposal actions across{' '}
            <span className="font-mono font-semibold text-white tabular-nums">
              {stats.totalEntries}
            </span>{' '}
            entries. Counts represent self-reported actions guided by EcoSort
            segregation rules.
          </p>
        </div>

        <div className="rounded-xl bg-white/10 border border-white/15 px-5 py-4 min-w-[240px] shrink-0">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-[#B8D4C2]">
              Eco Score
            </span>
            <span className="text-xs font-semibold text-[#FDE68A]">
              {stats.tierName}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              data-testid="dashboard-eco-score"
              className="text-3xl font-extrabold font-mono tabular-nums"
            >
              {stats.ecoScore}
            </span>
            <span className="text-xs text-[#D6E6DC] font-mono tabular-nums">
              / {stats.nextTierTarget} pts to {stats.nextTierName}
            </span>
          </div>
        </div>
      </section>

      {/* 4 KPI Cards (Matches PDF Page 11) */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 space-y-2">
          <CategoryIcon category="dry" size="sm" />
          <p
            data-testid="kpi-recyclable"
            className="text-2xl font-extrabold font-mono tabular-nums text-[#14231A] pt-1"
          >
            {stats.recyclableCount}
          </p>
          <p className="text-xs font-medium text-[#587062]">Recyclable Items</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 space-y-2">
          <CategoryIcon category="ewaste" size="sm" />
          <p
            data-testid="kpi-ewaste"
            className="text-2xl font-extrabold font-mono tabular-nums text-[#14231A] pt-1"
          >
            {stats.ewasteCount}
          </p>
          <p className="text-xs font-medium text-[#587062]">E-Waste Items</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 space-y-2">
          <CategoryIcon category="wet" size="sm" />
          <p
            data-testid="kpi-organic"
            className="text-2xl font-extrabold font-mono tabular-nums text-[#14231A] pt-1"
          >
            {stats.organicCount}
          </p>
          <p className="text-xs font-medium text-[#587062]">
            Organic Composted
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 space-y-2">
          <span className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#18432B] inline-flex items-center justify-center">
            <Recycle className="w-4 h-4" />
          </span>
          <p
            data-testid="kpi-total"
            className="text-2xl font-extrabold font-mono tabular-nums text-[#14231A] pt-1"
          >
            {stats.totalItems}
          </p>
          <p className="text-xs font-medium text-[#587062]">
            Total Items Logged
          </p>
        </div>
      </section>

      {/* Quick Launch Strip (Matches PDF Page 11) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => onNavigate('identify')}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#DCE5DF] hover:border-[#18432B]/40 text-sm font-semibold text-[#14231A] transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4 text-[#18432B]" />
          <span>Identify Waste</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('scan')}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#DCE5DF] hover:border-[#18432B]/40 text-sm font-semibold text-[#14231A] transition-colors cursor-pointer"
        >
          <Camera className="w-4 h-4 text-[#18432B]" />
          <span>Scan Waste Photo</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('centres')}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-[#DCE5DF] hover:border-[#18432B]/40 text-sm font-semibold text-[#14231A] transition-colors cursor-pointer"
        >
          <MapPin className="w-4 h-4 text-[#18432B]" />
          <span>Find Collection Centre</span>
        </button>
      </section>

      {/* Bottom 2-Column Recent Activities + Current Challenge */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E9EFEA]">
            <h2 className="text-base font-bold text-[#14231A]">
              Recent Activities
            </h2>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#18432B] hover:underline cursor-pointer"
            >
              <span>View full log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <ul className="divide-y divide-[#EEF3EF]">
            {recentActivities.map((entry) => (
              <li
                key={entry.id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <CategoryIcon category={entry.category} size="sm" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#14231A] truncate">
                      {entry.itemName} · {entry.action}
                    </p>
                    <p className="text-xs text-[#587062] font-mono tabular-nums">
                      {CATEGORY_META[entry.category].name} · Qty {entry.quantity} ·{' '}
                      {entry.date}
                    </p>
                  </div>
                </div>
                <span className="font-mono text-xs font-bold text-[#18432B] shrink-0 tabular-nums">
                  +{entry.points} pts
                </span>
              </li>
            ))}
          </ul>
        </div>

        {featuredChallenge && (
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E9EFEA]">
              <h2 className="text-base font-bold text-[#14231A]">
                Current Challenge
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('challenges')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#18432B] hover:underline cursor-pointer"
              >
                <span>All challenges</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#14231A]">
                  {featuredChallenge.title}
                </h3>
                <span className="font-mono text-xs font-bold text-[#18432B] tabular-nums">
                  +{featuredChallenge.bonusPoints} pts
                </span>
              </div>

              <p className="text-xs text-[#4B5E53]">
                {featuredChallenge.description}
              </p>

              <div className="flex items-center justify-between text-xs font-mono tabular-nums text-[#587062]">
                <span>
                  Progress: {featuredChallenge.progress} /{' '}
                  {featuredChallenge.target} items
                </span>
                <span className="font-semibold text-[#14231A]">
                  {challengePct}%
                </span>
              </div>

              <div className="h-2.5 rounded-full bg-[#EAF0EC] overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#18432B] transition-all duration-300"
                  style={{ width: `${challengePct}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
