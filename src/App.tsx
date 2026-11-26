import { useEffect, useMemo, useState } from 'react';
import { ChallengesView } from './components/ChallengesView';
import { DashboardView } from './components/DashboardView';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { IdentifyWasteView } from './components/IdentifyWasteView';
import { LearnView } from './components/LearnView';
import { MyActivityView } from './components/MyActivityView';
import { RecyclingCentresView } from './components/RecyclingCentresView';
import { ScanWasteView } from './components/ScanWasteView';
import { INITIAL_ACTIVITIES, INITIAL_CHALLENGES } from './data/wasteData';
import {
  ActivityEntry,
  ChallengeItem,
  NavTab,
  WasteActionType,
  WasteCategoryId,
} from './types/ecosort';
import { calculateActivityPoints, computeDashboardStats } from './utils/ecoRules';

const STORAGE_ACTIVITIES_KEY = 'ecosort_activities_v1';
const STORAGE_CHALLENGES_KEY = 'ecosort_challenges_v1';
const USER_NAME = 'Aarav Sharma';

function loadSaved<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') as NavTab | null;
    const validTabs: NavTab[] = [
      'home',
      'identify',
      'scan',
      'centres',
      'activity',
      'challenges',
      'learn',
      'dashboard',
    ];
    if (tabParam && validTabs.includes(tabParam)) return tabParam;
    if (params.get('autostart') === '1') return 'scan';
    return 'home';
  });

  const [activities, setActivities] = useState<ActivityEntry[]>(() =>
    loadSaved<ActivityEntry[]>(STORAGE_ACTIVITIES_KEY, INITIAL_ACTIVITIES)
  );

  const [challenges, setChallenges] = useState<ChallengeItem[]>(() =>
    loadSaved<ChallengeItem[]>(STORAGE_CHALLENGES_KEY, INITIAL_CHALLENGES)
  );

  const [identifyCategoryFilter, setIdentifyCategoryFilter] = useState<
    WasteCategoryId | 'all'
  >('all');
  const [centreMaterialFilter, setCentreMaterialFilter] =
    useState<string>('All Centres');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ACTIVITIES_KEY, JSON.stringify(activities));
    } catch {
      // Ignore storage quota issues
    }
  }, [activities]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHALLENGES_KEY, JSON.stringify(challenges));
    } catch {
      // Ignore storage quota issues
    }
  }, [challenges]);

  const stats = useMemo(
    () => computeDashboardStats(activities, challenges),
    [activities, challenges]
  );

  const handleLogDisposal = (input: {
    itemName: string;
    category: WasteCategoryId;
    action: WasteActionType;
    quantity: number;
    date?: string;
    notes: string;
    source: 'manual' | 'scan' | 'identify';
  }) => {
    const safeQty = Math.max(1, Math.round(input.quantity || 1));
    const points = calculateActivityPoints(
      input.category,
      input.action,
      safeQty
    );

    const newEntry: ActivityEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      itemName: input.itemName,
      category: input.category,
      action: input.action,
      quantity: safeQty,
      date: input.date || '2026-11-25',
      notes: input.notes,
      points,
      source: input.source,
    };

    setActivities((prev) => [newEntry, ...prev]);

    // Sync linked item challenges
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.type !== 'counter' || !ch.linkedCategory) return ch;
        if (ch.linkedCategory !== input.category) return ch;
        return {
          ...ch,
          progress: Math.min(ch.target, ch.progress + safeQty),
        };
      })
    );
  };

  const handleDeleteActivity = (id: string) => {
    setActivities((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleDay = (challengeId: string, dayIndex: number) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id !== challengeId || !ch.completedDays) return ch;
        const nextDays = ch.completedDays.map((done, idx) =>
          idx === dayIndex ? !done : done
        );
        const completedCount = nextDays.filter(Boolean).length;
        return {
          ...ch,
          completedDays: nextDays,
          progress: completedCount,
        };
      })
    );
  };

  const handleIncrementChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((ch) => {
        if (ch.id !== challengeId) return ch;
        return {
          ...ch,
          progress: Math.min(ch.target, ch.progress + 1),
        };
      })
    );
  };

  const handleFindCentreForMaterial = (material: string) => {
    setCentreMaterialFilter(material);
    setActiveTab('centres');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F8F6] text-[#14231A]">
      <Header
        activeTab={activeTab}
        onNavigate={handleNavigate}
        ecoScore={stats.ecoScore}
        userName={USER_NAME}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectCategoryFilter={(cat) => setIdentifyCategoryFilter(cat)}
          />
        )}

        {activeTab === 'identify' && (
          <IdentifyWasteView
            initialCategoryFilter={identifyCategoryFilter}
            onCategoryFilterChange={setIdentifyCategoryFilter}
            onLogDisposal={handleLogDisposal}
            onGoToScan={() => handleNavigate('scan')}
            onFindCentreForMaterial={handleFindCentreForMaterial}
          />
        )}

        {activeTab === 'scan' && (
          <ScanWasteView
            onLogDisposal={handleLogDisposal}
            onFindCentreForMaterial={handleFindCentreForMaterial}
          />
        )}

        {activeTab === 'centres' && (
          <RecyclingCentresView
            initialMaterialFilter={centreMaterialFilter}
            onMaterialFilterChange={setCentreMaterialFilter}
          />
        )}

        {activeTab === 'activity' && (
          <MyActivityView
            activities={activities}
            onAddActivity={handleLogDisposal}
            onDeleteActivity={handleDeleteActivity}
          />
        )}

        {activeTab === 'challenges' && (
          <ChallengesView
            challenges={challenges}
            onToggleDay={handleToggleDay}
            onIncrementChallenge={handleIncrementChallenge}
          />
        )}

        {activeTab === 'learn' && <LearnView onNavigate={handleNavigate} />}

        {activeTab === 'dashboard' && (
          <DashboardView
            userName={USER_NAME}
            stats={stats}
            activities={activities}
            challenges={challenges}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      <footer className="border-t border-[#E3EAE5] bg-white mt-12">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#587062]">
          <p>
            EcoSort — Smart Waste Segregation &amp; Circular Action Platform
          </p>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => handleNavigate('scan')}
              className="hover:text-[#14231A] cursor-pointer"
            >
              Scan Waste
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('centres')}
              className="hover:text-[#14231A] cursor-pointer"
            >
              Pune Centres
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('learn')}
              className="hover:text-[#14231A] cursor-pointer"
            >
              3R Guides
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
