import { useMemo, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  MapPin,
  PlusCircle,
  Search,
} from 'lucide-react';
import { CATEGORY_META, WASTE_CATALOG } from '../data/wasteData';
import { WasteActionType, WasteCatalogItem, WasteCategoryId } from '../types/ecosort';
import { calculateActivityPoints } from '../utils/ecoRules';
import { CategoryIcon } from './CategoryIcon';

interface IdentifyWasteViewProps {
  initialCategoryFilter: WasteCategoryId | 'all';
  onCategoryFilterChange: (filter: WasteCategoryId | 'all') => void;
  onLogDisposal: (entry: {
    itemName: string;
    category: WasteCategoryId;
    action: WasteActionType;
    quantity: number;
    notes: string;
    source: 'identify';
  }) => void;
  onGoToScan: () => void;
  onFindCentreForMaterial: (material: string) => void;
}

const FILTER_OPTIONS: { id: WasteCategoryId | 'all'; label: string }[] = [
  { id: 'all', label: 'All Streams' },
  { id: 'dry', label: 'Dry / Recyclable' },
  { id: 'wet', label: 'Wet / Organic' },
  { id: 'ewaste', label: 'E-Waste' },
  { id: 'hazardous', label: 'Hazardous / Special' },
];

export function IdentifyWasteView({
  initialCategoryFilter,
  onCategoryFilterChange,
  onLogDisposal,
  onGoToScan,
  onFindCentreForMaterial,
}: IdentifyWasteViewProps) {
  const [query, setQuery] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>(
    WASTE_CATALOG[0].id
  );
  const [recentlyLoggedId, setRecentlyLoggedId] = useState<string | null>(null);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return WASTE_CATALOG.filter((item) => {
      const catOk =
        initialCategoryFilter === 'all' ||
        item.category === initialCategoryFilter;
      if (!catOk) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.prepSummary.toLowerCase().includes(q) ||
        item.aliases.some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [query, initialCategoryFilter]);

  const activeItem: WasteCatalogItem | null = useMemo(() => {
    return (
      filteredItems.find((i) => i.id === selectedItemId) ||
      filteredItems[0] ||
      null
    );
  }, [filteredItems, selectedItemId]);

  const handleLogItem = (item: WasteCatalogItem) => {
    const meta = CATEGORY_META[item.category];
    onLogDisposal({
      itemName: item.name,
      category: item.category,
      action: meta.defaultAction,
      quantity: 1,
      notes: `Logged from Identify Waste · ${meta.binShort} — ${meta.shortName}`,
      source: 'identify',
    });
    setRecentlyLoggedId(item.id);
    setTimeout(() => {
      setRecentlyLoggedId((curr) => (curr === item.id ? null : curr));
    }, 2500);
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-[#18432B] tracking-wide">
            Manual Waste Lookup · Verified Segregation Rules
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#14231A] mt-1">
            Identify Waste Item
          </h1>
          <p className="text-sm text-[#4B5E53] mt-1">
            Search common household items to check bin rules, prep instructions,
            and Eco Score points—or switch to real photo scanning.
          </p>
        </div>

        <button
          type="button"
          onClick={onGoToScan}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#18432B] hover:bg-[#123320] text-white text-xs font-semibold transition-colors whitespace-nowrap shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Camera className="w-4 h-4" />
          <span>Scan Real Photo Instead</span>
        </button>
      </div>

      {/* Search & Stream Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE5DF] p-4 space-y-3">
        <div className="relative">
          <label htmlFor="identify-search" className="sr-only">
            Search waste items
          </label>
          <Search
            className="w-4 h-4 text-[#587062] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="identify-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search items (e.g., milk pouch, pizza box, battery, charger, medicine)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D4DFD8] bg-[#F8FAF8] text-sm text-[#14231A] placeholder:text-[#73887B] focus:outline-none focus:ring-2 focus:ring-[#18432B] focus:bg-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {FILTER_OPTIONS.map((opt) => {
            const active = initialCategoryFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onCategoryFilterChange(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#18432B] text-white'
                    : 'bg-[#F3F6F4] text-[#4B5E53] hover:text-[#14231A] hover:bg-[#E7EEE9]'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Split List + Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Catalog List */}
        <div className="lg:col-span-5 space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#DCE5DF] p-8 text-center space-y-3">
              <p className="text-sm font-semibold text-[#14231A]">
                No matching items found in the catalog
              </p>
              <p className="text-xs text-[#587062]">
                Try clearing your search or scan a real photo of the item with
                EcoSort AI Vision.
              </p>
              <button
                type="button"
                onClick={onGoToScan}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#18432B] text-white text-xs font-semibold cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Scan with AI Photo</span>
              </button>
            </div>
          ) : (
            filteredItems.map((item) => {
              const meta = CATEGORY_META[item.category];
              const isSelected = activeItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedItemId(item.id)}
                  className={`w-full flex items-center justify-between gap-3 p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#18432B] shadow-sm'
                      : 'bg-white border-[#DCE5DF] hover:border-[#18432B]/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={item.category} size="md" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[#14231A] truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-[#587062] truncate">
                        {meta.binShort} · {item.prepSummary}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-semibold text-[#18432B] shrink-0 tabular-nums">
                    +{meta.basePoints}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Item Detail Inspector */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE5DF] p-6">
          {activeItem ? (
            (() => {
              const meta = CATEGORY_META[activeItem.category];
              const pts = calculateActivityPoints(
                activeItem.category,
                meta.defaultAction,
                1
              );
              const isJustLogged = recentlyLoggedId === activeItem.id;
              const centreStream =
                activeItem.category === 'ewaste'
                  ? 'E-waste'
                  : activeItem.category === 'hazardous'
                    ? 'Hazardous'
                    : activeItem.materialTags[0] || 'General recycling';

              return (
                <div className="space-y-5">
                  <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#E9EFEA]">
                    <div className="flex items-start gap-3.5">
                      <CategoryIcon category={activeItem.category} size="lg" />
                      <div>
                        <p className="text-xs font-medium text-[#587062]">
                          {meta.name}
                        </p>
                        <h2 className="text-2xl font-bold text-[#14231A] mt-0.5">
                          {activeItem.name}
                        </h2>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[11px] font-medium text-[#587062]">
                        Eco Reward
                      </p>
                      <p className="text-lg font-bold font-mono text-[#18432B] tabular-nums">
                        +{pts} pts
                      </p>
                    </div>
                  </div>

                  <div
                    className={`rounded-xl p-4 border ${meta.bgTintClass} ${meta.borderColorClass}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#4B5E53]">
                      Recommended Bin / Stream
                    </p>
                    <p className="text-sm font-bold text-[#14231A] mt-1">
                      {activeItem.recommendedAction}
                    </p>
                  </div>

                  <div className="space-y-2.5">
                    <h3 className="text-sm font-bold text-[#14231A]">
                      Step-by-Step Preparation
                    </h3>
                    <ul className="space-y-2 text-sm text-[#3C4E43]">
                      {activeItem.disposalSteps.map((step, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-[#EAF3ED] text-[#18432B] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5 tabular-nums">
                            {i + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] p-4 text-xs text-[#3C4E43]">
                    <span className="font-semibold text-[#14231A]">
                      Environmental impact:{' '}
                    </span>
                    {activeItem.impactNote}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#E9EFEA]">
                    <button
                      type="button"
                      onClick={() => handleLogItem(activeItem)}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                        isJustLogged
                          ? 'bg-[#EAF3ED] text-[#18432B] border border-[#B8D4C2]'
                          : 'bg-[#18432B] hover:bg-[#123320] text-white'
                      }`}
                    >
                      {isJustLogged ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Logged (+{pts} pts)</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-4 h-4" />
                          <span>Log Disposal to My Activity</span>
                        </>
                      )}
                    </button>

                    {(activeItem.category === 'ewaste' ||
                      activeItem.category === 'hazardous' ||
                      activeItem.category === 'dry') && (
                      <button
                        type="button"
                        onClick={() => onFindCentreForMaterial(centreStream)}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#D4DFD8] bg-white hover:bg-[#F3F6F4] text-sm font-semibold text-[#14231A] cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-[#18432B]" />
                        <span>Find Nearest Drop-off</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            <p className="text-sm text-[#587062]">
              Select an item from the list to view full disposal rules.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
