import { ArrowRight, Camera, MapPin, Search } from 'lucide-react';
import { CATEGORY_META } from '../data/wasteData';
import { NavTab, WasteCategoryId } from '../types/ecosort';
import { CategoryIcon } from './CategoryIcon';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectCategoryFilter: (cat: WasteCategoryId) => void;
}

const CORE_FLOW_ITEMS: {
  item: string;
  stream: string;
  destination: string;
  category: WasteCategoryId;
  destClass: string;
}[] = [
  {
    item: 'Plastic Bottle',
    stream: 'Dry / Recyclable',
    destination: 'Blue Bin',
    category: 'dry',
    destClass: 'text-blue-700',
  },
  {
    item: 'Banana Peel',
    stream: 'Wet / Organic',
    destination: 'Green Bin',
    category: 'wet',
    destClass: 'text-emerald-700',
  },
  {
    item: 'Old Mobile Phone',
    stream: 'E-Waste',
    destination: 'Authorized E-Waste Hub',
    category: 'ewaste',
    destClass: 'text-amber-700',
  },
  {
    item: 'Expired Medicine Strip',
    stream: 'Hazardous / Special',
    destination: 'Pharmacy / Special Drop-Off',
    category: 'hazardous',
    destClass: 'text-red-700',
  },
];

export function HomeView({
  onNavigate,
  onSelectCategoryFilter,
}: HomeViewProps) {
  const categories = Object.values(CATEGORY_META);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-12">
      {/* Hero Split Section (Matches PDF Page 4) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        <div className="lg:col-span-7 space-y-6">
          <p className="text-xs font-medium text-[#4B5E53] tracking-wide">
            Environmental Science Platform · Mobile-First Web App
          </p>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#14231A] leading-[1.1] text-balance">
            Sort Smart.{' '}
            <span className="text-[#18432B]">Recycle Right.</span> Protect Our
            Environment.
          </h1>

          <p className="text-base sm:text-[17px] text-[#4B5E53] leading-relaxed max-w-2xl">
            Most recoverable waste ends up in landfills simply because people
            are not sure which bin to use at the moment of disposal. EcoSort
            turns confusion into clear action—helping you identify items from
            real photos, follow proper disposal steps, locate Pune recycling
            centres, and build lasting eco habits.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={() => onNavigate('scan')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#18432B] hover:bg-[#123320] text-white text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Camera className="w-4 h-4" aria-hidden="true" />
              <span>Scan Waste Photo</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('identify')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#F3F6F4] text-[#14231A] border border-[#D4DFD8] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-[#4B5E53]" aria-hidden="true" />
              <span>Identify Waste</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('centres')}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-white hover:bg-[#F3F6F4] text-[#14231A] border border-[#D4DFD8] text-sm font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <MapPin className="w-4 h-4 text-[#4B5E53]" aria-hidden="true" />
              <span>Find Recycling Centre</span>
            </button>
          </div>
        </div>

        {/* Core Segregation Flow Card (Matches PDF Page 4 Right Card) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-2xl border border-[#DCE5DF] shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#E9EFEA]">
              <div>
                <p className="text-[11px] font-semibold tracking-wider text-[#587062] uppercase">
                  Core Segregation Flow
                </p>
                <h2 className="text-lg font-bold text-[#14231A] mt-0.5">
                  From Doubt to Proper Action
                </h2>
              </div>
              <span className="text-xs font-medium text-[#587062] whitespace-nowrap">
                4 Categories
              </span>
            </div>

            <div className="mt-4 space-y-2.5">
              {CORE_FLOW_ITEMS.map((row) => (
                <button
                  key={row.item}
                  type="button"
                  onClick={() => {
                    onSelectCategoryFilter(row.category);
                    onNavigate('identify');
                  }}
                  className="w-full flex items-center justify-between gap-3 p-3 rounded-xl bg-[#F8FAF8] hover:bg-[#EFF5F0] border border-[#E6EDE8] transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <CategoryIcon category={row.category} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#14231A] truncate">
                        {row.item}
                      </p>
                      <p className="text-xs text-[#587062]">{row.stream}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold whitespace-nowrap shrink-0 ${row.destClass}`}
                  >
                    {row.destination}
                  </span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-[#E9EFEA] flex items-center justify-between gap-3 text-xs text-[#587062]">
              <span>AI Photo Scan · Manual Fallback · Disposal Log</span>
              <button
                type="button"
                onClick={() => onNavigate('scan')}
                className="font-semibold text-[#18432B] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Try Scan →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Four-Category Waste Classification (Matches PDF Page 5) */}
      <section className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#18432B] tracking-wide">
              Four-Category Waste Classification
            </p>
            <h2 className="text-2xl font-bold text-[#14231A] mt-1">
              Every Everyday Item Mapped to a Verified Stream
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('learn')}
            className="text-sm font-semibold text-[#18432B] hover:underline self-start sm:self-auto cursor-pointer"
          >
            Read 3R Segregation Guides →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                onSelectCategoryFilter(cat.id);
                onNavigate('identify');
              }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white border border-[#DCE5DF] hover:border-[#18432B]/40 transition-colors text-left cursor-pointer"
            >
              <CategoryIcon category={cat.id} size="lg" />
              <div className="space-y-1">
                <h3 className="text-base font-bold text-[#14231A]">
                  {cat.binShort} — {cat.shortName}
                </h3>
                <p className="text-sm text-[#4B5E53]">{cat.subtitle}</p>
                <p className="text-xs font-medium text-[#18432B] pt-1">
                  +{cat.basePoints} base Eco Score pts per disposal
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Context Metrics Strip (Matches PDF Pages 2 & 3) */}
      <section className="rounded-2xl bg-[#18432B] text-white p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        <div>
          <p className="text-xs font-medium text-[#B8D4C2]">
            India’s Source Segregation Gap
          </p>
          <p className="text-3xl sm:text-4xl font-extrabold font-mono tabular-nums mt-1">
            62M+ <span className="text-base font-sans font-medium text-[#D6E6DC]">tonnes/yr</span>
          </p>
          <p className="text-xs text-[#F59E0B] font-medium mt-1">
            Only 30–35% segregated at source (CPCB Report)
          </p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6">
          <p className="text-sm font-semibold">E-Waste Leakage</p>
          <p className="text-2xl font-bold font-mono tabular-nums mt-1">
            14.14 lakh <span className="text-sm font-sans font-normal text-[#D6E6DC]">tonnes/yr</span>
          </p>
          <p className="text-xs text-[#D6E6DC] mt-1">
            Route phones, cables, and batteries to authorized hubs.
          </p>
        </div>

        <div className="border-t md:border-t-0 md:border-l border-white/15 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">Track Your Personal Impact</p>
            <p className="text-xs text-[#D6E6DC] mt-1">
              Log recycled, composted, reused, and e-waste actions to earn your
              Green Guardian tier.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="self-start px-4 py-2 rounded-lg bg-white text-[#18432B] text-xs font-semibold hover:bg-[#EAF3ED] transition-colors cursor-pointer"
          >
            Open Impact Dashboard →
          </button>
        </div>
      </section>
    </div>
  );
}
