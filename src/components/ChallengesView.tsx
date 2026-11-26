import { Check, Plus } from 'lucide-react';
import { ChallengeItem } from '../types/ecosort';

interface ChallengesViewProps {
  challenges: ChallengeItem[];
  onToggleDay: (challengeId: string, dayIndex: number) => void;
  onIncrementChallenge: (challengeId: string) => void;
}

export function ChallengesView({
  challenges,
  onToggleDay,
  onIncrementChallenge,
}: ChallengesViewProps) {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div>
        <p className="text-xs font-semibold text-[#18432B] tracking-wide">
          Module 04 · Habit-Building Gamification
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#14231A] mt-1">
          Waste Segregation Challenges
        </h1>
        <p className="text-sm text-[#4B5E53] mt-1">
          Build consistent segregation habits with 7-day trackers and targeted
          recycling goals. Completing challenges awards bonus Eco Score points.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {challenges.map((challenge) => {
          const pct = Math.min(
            100,
            Math.round((challenge.progress / challenge.target) * 100)
          );
          const isComplete = challenge.progress >= challenge.target;

          return (
            <article
              key={challenge.id}
              className="bg-white rounded-2xl border border-[#DCE5DF] p-5 sm:p-6 flex flex-col justify-between gap-5"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold text-[#4B5E53]">
                    {challenge.tag}
                  </span>
                  <span className="font-mono font-bold text-[#18432B] tabular-nums">
                    +{challenge.bonusPoints} Eco Score
                  </span>
                </div>

                <h2 className="text-lg font-bold text-[#14231A]">
                  {challenge.title}
                </h2>
                <p className="text-sm text-[#4B5E53]">
                  {challenge.description}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-[#4B5E53] font-mono tabular-nums">
                    {challenge.progress} / {challenge.target}{' '}
                    {challenge.type === 'streak' ? 'days' : 'items'}
                  </span>
                  <span className="text-[#14231A] font-mono tabular-nums">
                    {pct}%
                  </span>
                </div>

                <div className="h-2.5 rounded-full bg-[#EAF0EC] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      challenge.accentTone === 'amber'
                        ? 'bg-[#D97706]'
                        : challenge.accentTone === 'blue'
                          ? 'bg-blue-600'
                          : 'bg-[#18432B]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {challenge.type === 'streak' && challenge.completedDays ? (
                  <div className="space-y-2 pt-1">
                    <p className="text-xs text-[#587062]">
                      Click each day to mark complete:
                    </p>
                    <div className="grid grid-cols-7 gap-2">
                      {challenge.completedDays.map((done, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => onToggleDay(challenge.id, idx)}
                          aria-pressed={done}
                          aria-label={`${challenge.title} Day 0${idx + 1}`}
                          className={`h-10 rounded-lg text-xs font-mono font-semibold border transition-colors cursor-pointer ${
                            done
                              ? 'bg-[#18432B] text-white border-[#18432B]'
                              : 'bg-[#F8FAF8] text-[#4B5E53] border-[#D4DFD8] hover:border-[#18432B]'
                          }`}
                        >
                          0{idx + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-1">
                    <button
                      type="button"
                      disabled={isComplete}
                      onClick={() => onIncrementChallenge(challenge.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                        isComplete
                          ? 'bg-[#EAF3ED] text-[#18432B] border border-[#B8D4C2] cursor-default'
                          : 'bg-[#18432B] hover:bg-[#123320] text-white'
                      }`}
                    >
                      {isComplete ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Challenge Completed (+{challenge.bonusPoints} pts)</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Log +1 Progress</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
