import { FormEvent, useMemo, useState } from 'react';
import { CheckCircle2, PlusCircle, Trash2 } from 'lucide-react';
import { CATEGORY_META, WASTE_CATALOG } from '../data/wasteData';
import {
  ActivityEntry,
  WasteActionType,
  WasteCategoryId,
} from '../types/ecosort';
import { calculateActivityPoints } from '../utils/ecoRules';
import { CategoryIcon } from './CategoryIcon';

interface MyActivityViewProps {
  activities: ActivityEntry[];
  onAddActivity: (entry: {
    itemName: string;
    category: WasteCategoryId;
    action: WasteActionType;
    quantity: number;
    date: string;
    notes: string;
    source: 'manual';
  }) => void;
  onDeleteActivity: (id: string) => void;
}

const ACTION_OPTIONS: WasteActionType[] = [
  'Recycled',
  'Composted',
  'Reused',
  'E-Waste Disposal',
  'Hazardous Drop-Off',
];

export function MyActivityView({
  activities,
  onAddActivity,
  onDeleteActivity,
}: MyActivityViewProps) {
  const [quickCatalogId, setQuickCatalogId] = useState('');
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<WasteCategoryId>('dry');
  const [action, setAction] = useState<WasteActionType>('Recycled');
  const [quantity, setQuantity] = useState(1);
  const [date, setDate] = useState('2026-11-25');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [historyFilter, setHistoryFilter] = useState<WasteCategoryId | 'all'>(
    'all'
  );

  const handleQuickFill = (catalogId: string) => {
    setQuickCatalogId(catalogId);
    const match = WASTE_CATALOG.find((item) => item.id === catalogId);
    if (!match) return;
    setItemName(match.name);
    setCategory(match.category);
    setAction(CATEGORY_META[match.category].defaultAction);
    setFormError(null);
  };

  const handleCategoryChange = (nextCategory: WasteCategoryId) => {
    setCategory(nextCategory);
    setAction(CATEGORY_META[nextCategory].defaultAction);
  };

  const previewPoints = useMemo(
    () => calculateActivityPoints(category, action, quantity),
    [category, action, quantity]
  );

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = itemName.trim();
    if (!trimmedName) {
      setFormError('Please enter an item name before saving.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 1) {
      setFormError('Quantity must be at least 1.');
      return;
    }

    onAddActivity({
      itemName: trimmedName,
      category,
      action,
      quantity,
      date: date || '2026-11-25',
      notes: notes.trim(),
      source: 'manual',
    });

    setSavedNotice(
      `Saved "${trimmedName}" (+${previewPoints} Eco Score pts).`
    );
    setFormError(null);
    setQuickCatalogId('');
    setItemName('');
    setQuantity(1);
    setNotes('');
  };

  const filteredActivities = useMemo(() => {
    if (historyFilter === 'all') return activities;
    return activities.filter((a) => a.category === historyFilter);
  }, [activities, historyFilter]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#18432B] tracking-wide">
          Module 03 · Waste Disposal Tracker
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#14231A] mt-1">
          My Activity
        </h1>
        <p className="text-sm text-[#4B5E53] mt-1">
          Record every item you recycle, compost, reuse, or take to an
          authorized e-waste / hazardous centre to track your personal Eco
          Score.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form Column (Matches PDF Page 9) */}
        <section className="lg:col-span-5 bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6">
          <h2 className="text-base font-bold text-[#14231A] flex items-center gap-2 pb-4 border-b border-[#E9EFEA]">
            <PlusCircle className="w-4 h-4 text-[#18432B]" aria-hidden="true" />
            <span>Record Responsible Disposal</span>
          </h2>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
            <div>
              <label
                htmlFor="quick-fill-catalog"
                className="block text-xs font-medium text-[#4B5E53] mb-1"
              >
                Quick Fill from Catalog (optional)
              </label>
              <select
                id="quick-fill-catalog"
                value={quickCatalogId}
                onChange={(e) => handleQuickFill(e.target.value)}
                className="w-full rounded-xl border border-[#CFDAD3] bg-[#F8FAF8] px-3 py-2.5 text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
              >
                <option value="">
                  — Choose a catalog item or enter custom below —
                </option>
                {WASTE_CATALOG.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({CATEGORY_META[item.category].shortName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="activity-item-name"
                className="block text-xs font-medium text-[#4B5E53] mb-1"
              >
                Item Name
              </label>
              <input
                id="activity-item-name"
                type="text"
                value={itemName}
                onChange={(e) => {
                  setItemName(e.target.value);
                  if (formError) setFormError(null);
                }}
                placeholder="e.g., Old Mobile Phone, Plastic Bottle"
                className="w-full rounded-xl border border-[#CFDAD3] bg-white px-3.5 py-2.5 text-sm text-[#14231A] placeholder:text-[#869A8E] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="activity-category"
                  className="block text-xs font-medium text-[#4B5E53] mb-1"
                >
                  Category
                </label>
                <select
                  id="activity-category"
                  value={category}
                  onChange={(e) =>
                    handleCategoryChange(e.target.value as WasteCategoryId)
                  }
                  className="w-full rounded-xl border border-[#CFDAD3] bg-white px-3 py-2.5 text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
                >
                  <option value="dry">Dry / Recyclable Waste</option>
                  <option value="wet">Wet / Organic Waste</option>
                  <option value="ewaste">E-Waste</option>
                  <option value="hazardous">Hazardous / Special Waste</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="activity-action"
                  className="block text-xs font-medium text-[#4B5E53] mb-1"
                >
                  Action
                </label>
                <select
                  id="activity-action"
                  value={action}
                  onChange={(e) => setAction(e.target.value as WasteActionType)}
                  className="w-full rounded-xl border border-[#CFDAD3] bg-white px-3 py-2.5 text-sm text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
                >
                  {ACTION_OPTIONS.map((act) => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="activity-quantity"
                  className="block text-xs font-medium text-[#4B5E53] mb-1"
                >
                  Quantity
                </label>
                <input
                  id="activity-quantity"
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(Math.max(1, Number(e.target.value) || 1))
                  }
                  className="w-full rounded-xl border border-[#CFDAD3] bg-white px-3.5 py-2.5 text-sm font-mono tabular-nums text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
                />
              </div>

              <div>
                <label
                  htmlFor="activity-date"
                  className="block text-xs font-medium text-[#4B5E53] mb-1"
                >
                  Date
                </label>
                <input
                  id="activity-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-xl border border-[#CFDAD3] bg-white px-3 py-2.5 text-sm font-mono tabular-nums text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="activity-notes"
                className="block text-xs font-medium text-[#4B5E53] mb-1"
              >
                Notes (optional)
              </label>
              <input
                id="activity-notes"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Dropped at Sahyadri E-Waste Hub"
                className="w-full rounded-xl border border-[#CFDAD3] bg-white px-3.5 py-2.5 text-sm text-[#14231A] placeholder:text-[#869A8E] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
              />
            </div>

            {formError && (
              <p
                role="alert"
                className="text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2"
              >
                {formError}
              </p>
            )}

            {savedNotice && (
              <p className="text-xs font-medium text-[#18432B] bg-[#EAF3ED] border border-[#B8D4C2] rounded-lg px-3 py-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedNotice}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#18432B] hover:bg-[#123320] text-white text-sm font-semibold transition-colors cursor-pointer"
            >
              Save Disposal Activity (+{previewPoints} pts)
            </button>
          </form>
        </section>

        {/* Right Disposal History Column (Matches PDF Page 9) */}
        <section className="lg:col-span-7 bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9EFEA]">
            <h2 className="text-base font-bold text-[#14231A]">
              Disposal History ({filteredActivities.length})
            </h2>
            <div>
              <label htmlFor="history-filter" className="sr-only">
                Filter disposal history by category
              </label>
              <select
                id="history-filter"
                value={historyFilter}
                onChange={(e) =>
                  setHistoryFilter(e.target.value as WasteCategoryId | 'all')
                }
                className="rounded-lg border border-[#CFDAD3] bg-[#F8FAF8] px-3 py-1.5 text-xs font-medium text-[#14231A] focus:outline-none focus:ring-2 focus:ring-[#18432B]"
              >
                <option value="all">All Categories</option>
                <option value="dry">Dry / Recyclable Waste</option>
                <option value="wet">Wet / Organic Waste</option>
                <option value="ewaste">E-Waste</option>
                <option value="hazardous">Hazardous / Special Waste</option>
              </select>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <p className="text-sm font-semibold text-[#14231A]">
                No logged entries in this category yet
              </p>
              <p className="text-xs text-[#587062]">
                Use the form on the left or scan a photo to record your first
                responsible disposal.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-[#EEF3EF]">
              {filteredActivities.map((entry) => {
                const meta = CATEGORY_META[entry.category];
                return (
                  <li
                    key={entry.id}
                    className="py-3.5 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <CategoryIcon category={entry.category} size="sm" />
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-bold text-[#14231A]">
                          {entry.itemName}{' '}
                          <span className="font-medium text-[#587062]">
                            · {entry.action}
                          </span>
                        </p>
                        <p className="text-xs text-[#4B5E53] font-mono tabular-nums">
                          {meta.name} · Qty: {entry.quantity} · {entry.date}
                        </p>
                        {entry.notes && (
                          <p className="text-xs text-[#677D70]">
                            {entry.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 shrink-0">
                      <span className="font-mono text-sm font-bold text-[#18432B] tabular-nums">
                        +{entry.points}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteActivity(entry.id)}
                        aria-label={`Delete ${entry.itemName} (${entry.date})`}
                        className="p-1.5 rounded-lg text-[#758B7D] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
