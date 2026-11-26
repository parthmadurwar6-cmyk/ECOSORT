import { useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Recycle, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { AWARENESS_GUIDES } from '../data/wasteData';
import { LearningGuide, NavTab } from '../types/ecosort';

interface LearnViewProps {
  onNavigate: (tab: NavTab) => void;
}

const TOPICS = [
  'All Topics',
  'Segregation Basics',
  'Plastic & Recycling',
  'E-Waste',
  'Composting',
  '3R Principle',
];

export function LearnView({ onNavigate }: LearnViewProps) {
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [activeGuide, setActiveGuide] = useState<LearningGuide | null>(null);

  const visibleGuides = useMemo(() => {
    if (selectedTopic === 'All Topics') return AWARENESS_GUIDES;
    return AWARENESS_GUIDES.filter((g) => g.topic === selectedTopic);
  }, [selectedTopic]);

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div>
        <p className="text-xs font-semibold text-[#18432B] tracking-wide">
          Module 05 · Environmental Awareness &amp; 3R Hub
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#14231A] mt-1">
          Learn Waste Segregation &amp; the 3Rs
        </h1>
        <p className="text-sm text-[#4B5E53] mt-1">
          Concise, student-friendly guides explaining why sorting matters, how
          recycling works, how to compost, and how EcoSort fits into the
          Reduce–Reuse–Recycle hierarchy.
        </p>
      </div>

      {/* The 3R Principle Connected to EcoSort (Matches PDF Page 10 Right) */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-[#14231A]">
          The 3R Principle Connected to EcoSort
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="w-8 h-8 rounded-lg bg-[#EAF3ED] text-[#18432B] inline-flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="font-semibold text-[#587062]">Priority #1</span>
              </div>
              <h3 className="text-base font-bold text-[#14231A]">Reduce</h3>
              <p className="text-xs font-medium text-[#18432B]">
                Generate less waste at the source
              </p>
              <p className="text-sm text-[#4B5E53]">
                Prevention has the highest environmental payoff. Avoid
                unnecessary single-use bottles, plastic cutlery, and excess
                packaging.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('challenges')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18432B] hover:underline self-start cursor-pointer"
            >
              <span>Try &ldquo;Avoid Single-Use Plastic&rdquo; Challenge</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 inline-flex items-center justify-center">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <span className="font-semibold text-[#587062]">Priority #2</span>
              </div>
              <h3 className="text-base font-bold text-[#14231A]">Reuse</h3>
              <p className="text-xs font-medium text-emerald-700">
                Use products again before discarding
              </p>
              <p className="text-sm text-[#4B5E53]">
                Refill glass jars, repair electronics when viable, donate
                wearable clothes, and repurpose sturdy cardboard boxes.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('activity')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18432B] hover:underline self-start cursor-pointer"
            >
              <span>Log a &ldquo;Reused&rdquo; Action in My Activity</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-[#DCE5DF] p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 inline-flex items-center justify-center">
                  <Recycle className="w-4 h-4" />
                </span>
                <span className="font-semibold text-[#587062]">Priority #3</span>
              </div>
              <h3 className="text-base font-bold text-[#14231A]">Recycle</h3>
              <p className="text-xs font-medium text-blue-700">
                Process sorted waste into new material
              </p>
              <p className="text-sm text-[#4B5E53]">
                When items reach end-of-life, keep dry recyclables clean,
                compost organics, and route e-waste to authorized collection
                centres.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('identify')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18432B] hover:underline self-start cursor-pointer"
            >
              <span>Look Up Proper Recycling Rules</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Awareness Guides */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-base font-bold text-[#14231A] flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#18432B]" aria-hidden="true" />
            <span>Awareness Guides</span>
          </h2>

          <div className="flex flex-wrap items-center gap-1.5">
            {TOPICS.map((topic) => {
              const active = selectedTopic === topic;
              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-[#18432B] text-white'
                      : 'bg-white border border-[#DCE5DF] text-[#4B5E53] hover:text-[#14231A]'
                  }`}
                >
                  {topic}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {visibleGuides.map((guide) => (
            <article
              key={guide.id}
              className="bg-white rounded-2xl border border-[#DCE5DF] p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#587062]">
                  <span className="font-semibold text-[#18432B]">
                    {guide.topic}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>{guide.readTime}</span>
                </div>
                <h3 className="text-base font-bold text-[#14231A]">
                  {guide.title}
                </h3>
                <p className="text-sm text-[#4B5E53] leading-relaxed">
                  {guide.summary}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveGuide(guide)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#18432B] hover:underline self-start cursor-pointer"
              >
                <span>Read Guide</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Guide Reader Modal */}
      {activeGuide && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeGuide.title}
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl border border-[#DCE5DF] max-w-xl w-full p-6 space-y-4 shadow-xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#E9EFEA]">
              <div>
                <p className="text-xs font-semibold text-[#18432B]">
                  {activeGuide.topic} · {activeGuide.readTime}
                </p>
                <h2 className="text-xl font-bold text-[#14231A] mt-0.5">
                  {activeGuide.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                aria-label="Close guide"
                className="p-1.5 rounded-lg text-[#587062] hover:bg-[#F3F6F4] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-[#3C4E43] leading-relaxed">
              {activeGuide.fullContent.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="rounded-xl bg-[#F8FAF8] border border-[#E6EDE8] p-4 space-y-2">
              <p className="text-xs font-bold text-[#14231A]">Key Takeaways</p>
              <ul className="space-y-1.5 text-xs text-[#3C4E43]">
                {activeGuide.keyTakeaways.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-[#18432B]">
                      0{i + 1}.
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => setActiveGuide(null)}
                className="px-4 py-2 rounded-xl bg-[#18432B] hover:bg-[#123320] text-white text-xs font-semibold cursor-pointer"
              >
                Done Reading
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
