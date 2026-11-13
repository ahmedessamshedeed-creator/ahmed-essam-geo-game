import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, Clock, RotateCcw, Trophy, XCircle } from 'lucide-react';
import {
  BUBBLES_QUESTIONS,
  CONTINENTS_ATLAS,
  GAME_MODES,
  GENIUS_QUESTIONS,
  GameModeId,
  MAP_QUESTIONS,
  MCQ_QUESTIONS,
  SHOOTING_QUESTIONS,
  TF_QUESTIONS,
} from '../data/geographyData';
import { ContinentMap } from './ContinentMaps';
import { soundEngine } from '../utils/sound';

interface DuelQuestion {
  id: string;
  type: 'choice' | 'tf' | 'map';
  prompt: string;
  options: string[];
  correctIndex: number;
  continent?: 'north_america' | 'south_america' | 'australia' | 'antarctica';
  targetPinId?: string;
}

interface TeamMistake {
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

interface TeamState {
  index: number;
  score: number;
  timeLeft: number;
  locked: boolean;
  verdict: 'ok' | 'bad' | null;
  selectedOpt: number | null;
  finished: boolean;
  mistakes: TeamMistake[];
}

interface DuelArenaProps {
  mode: GameModeId;
  teamNames: [string, string];
  onExit: () => void;
}

const QUESTION_TIME = 15;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildDuelBank(mode: GameModeId): DuelQuestion[] {
  if (mode === 'tf') {
    return TF_QUESTIONS.slice(0, 8).map((q) => ({
      id: q.id,
      type: 'tf',
      prompt: q.statement,
      options: ['صواب', 'خطأ'],
      correctIndex: q.isTrue ? 0 : 1,
    }));
  }

  if (mode === 'maps') {
    return MAP_QUESTIONS.slice(0, 8).map((q) => ({
      id: q.id,
      type: 'map',
      prompt: q.prompt,
      options: q.options,
      correctIndex: q.correctIndex,
      continent: q.continent,
      targetPinId: q.targetPinId,
    }));
  }

  const source =
    mode === 'genius'
      ? GENIUS_QUESTIONS
      : mode === 'bubbles'
      ? BUBBLES_QUESTIONS
      : mode === 'shooting'
      ? SHOOTING_QUESTIONS
      : MCQ_QUESTIONS;

  return source.slice(0, 8).map((q) => ({
    id: q.id,
    type: 'choice',
    prompt: q.prompt,
    options: q.options,
    correctIndex: q.correctIndex,
  }));
}

const createInitialTeamState = (): TeamState => ({
  index: 0,
  score: 0,
  timeLeft: QUESTION_TIME,
  locked: false,
  verdict: null,
  selectedOpt: null,
  finished: false,
  mistakes: [],
});

export const DuelArena: React.FC<DuelArenaProps> = ({ mode, teamNames, onExit }) => {
  const modeMeta = GAME_MODES.find((m) => m.id === mode)!;

  const [seed, setSeed] = useState(0);

  const decks = useMemo<[DuelQuestion[], DuelQuestion[]]>(() => {
    const base = buildDuelBank(mode);
    return [shuffleArray(base), shuffleArray(base)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seed]);

  const [teams, setTeams] = useState<[TeamState, TeamState]>([
    createInitialTeamState(),
    createInitialTeamState(),
  ]);

  const bothFinished = teams[0].finished && teams[1].finished;

  // Independent 100ms timer ticks for both active teams
  useEffect(() => {
    if (bothFinished) return;

    const timer = window.setInterval(() => {
      setTeams((prev) => {
        const next: [TeamState, TeamState] = [{ ...prev[0] }, { ...prev[1] }];
        let changed = false;

        ([0, 1] as const).forEach((tIdx) => {
          const team = next[tIdx];
          if (team.finished || team.locked) return;

          changed = true;
          if (team.timeLeft <= 0.1) {
            const q = decks[tIdx][team.index];
            soundEngine.playWrong();
            team.timeLeft = 0;
            team.locked = true;
            team.verdict = 'bad';
            team.mistakes = [
              ...team.mistakes,
              {
                question: q.prompt,
                userAnswer: 'انتهى الوقت',
                correctAnswer: q.options[q.correctIndex],
              },
            ];

            // Schedule advance for this team
            window.setTimeout(() => {
              advanceTeam(tIdx);
            }, 950);
          } else {
            team.timeLeft = Number((team.timeLeft - 0.1).toFixed(1));
          }
        });

        return changed ? next : prev;
      });
    }, 100);

    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bothFinished, decks]);

  const advanceTeam = (teamIdx: 0 | 1) => {
    setTeams((prev) => {
      const next: [TeamState, TeamState] = [{ ...prev[0] }, { ...prev[1] }];
      const t = next[teamIdx];
      const total = decks[teamIdx].length;
      if (t.index + 1 >= total) {
        t.finished = true;
        t.locked = true;
      } else {
        t.index += 1;
        t.timeLeft = QUESTION_TIME;
        t.locked = false;
        t.verdict = null;
        t.selectedOpt = null;
      }
      return next;
    });
  };

  const handleAnswer = (teamIdx: 0 | 1, optIdx: number) => {
    const team = teams[teamIdx];
    if (team.locked || team.finished) return;

    const q = decks[teamIdx][team.index];
    const isOk = optIdx === q.correctIndex;

    if (isOk) {
      soundEngine.playCorrect();
    } else {
      soundEngine.playWrong();
    }

    setTeams((prev) => {
      const next: [TeamState, TeamState] = [{ ...prev[0] }, { ...prev[1] }];
      const t = next[teamIdx];
      t.locked = true;
      t.selectedOpt = optIdx;
      t.verdict = isOk ? 'ok' : 'bad';
      if (isOk) {
        t.score += 1;
      } else {
        t.mistakes = [
          ...t.mistakes,
          {
            question: q.prompt,
            userAnswer: q.options[optIdx],
            correctAnswer: q.options[q.correctIndex],
          },
        ];
      }
      return next;
    });

    window.setTimeout(() => {
      advanceTeam(teamIdx);
    }, 950);
  };

  useEffect(() => {
    if (bothFinished) {
      soundEngine.playVictory();
    }
  }, [bothFinished]);

  const handleRematch = () => {
    soundEngine.playClick();
    setSeed((s) => s + 1);
    setTeams([createInitialTeamState(), createInitialTeamState()]);
  };

  const winnerText = useMemo(() => {
    if (teams[0].score > teams[1].score) return `الفائز: ${teamNames[0]}`;
    if (teams[1].score > teams[0].score) return `الفائز: ${teamNames[1]}`;
    return 'تعادل رائع بين الفريقين!';
  }, [teams, teamNames]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-50">
      {/* Top Arena Bar */}
      <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
        >
          <ArrowRight className="h-4 w-4" />
          <span>خروج</span>
        </button>

        <h1 className="font-display truncate text-center text-base font-black text-slate-900 sm:text-lg">
          منافسة الفريقين · {modeMeta.title}
        </h1>

        <span className="hidden sm:inline text-xs font-bold text-amber-700 whitespace-nowrap shrink-0">
          ١٥ ثانية لكل سؤال
        </span>
      </header>

      {/* Split Screen Halves OR Final Result */}
      {bothFinished ? (
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="mx-auto max-w-5xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200">
              <Trophy className="h-8 w-8" />
            </div>
            <h2 className="font-display text-2xl font-black text-slate-900 sm:text-3xl">{winnerText}</h2>

            <div className="mx-auto mt-6 grid max-w-xl grid-cols-2 gap-4 tabular-nums">
              <div className="rounded-xl border-2 border-teal-600 bg-teal-50/70 p-4">
                <span className="block text-sm font-bold text-teal-800">{teamNames[0]}</span>
                <span className="font-display mt-1 block text-3xl font-black text-teal-900">
                  {teams[0].score} / {decks[0].length}
                </span>
              </div>
              <div className="rounded-xl border-2 border-orange-600 bg-orange-50/70 p-4">
                <span className="block text-sm font-bold text-orange-800">{teamNames[1]}</span>
                <span className="font-display mt-1 block text-3xl font-black text-orange-900">
                  {teams[1].score} / {decks[1].length}
                </span>
              </div>
            </div>

            {/* Side-by-side Mistakes Review */}
            <div className="mt-7 grid grid-cols-1 gap-4 text-right md:grid-cols-2">
              {([0, 1] as const).map((tIdx) => (
                <div
                  key={tIdx}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4 max-h-72 overflow-y-auto"
                >
                  <h3
                    className={`font-display mb-3 text-base font-extrabold ${
                      tIdx === 0 ? 'text-teal-800' : 'text-orange-800'
                    }`}
                  >
                    أخطاء {teamNames[tIdx]} ({teams[tIdx].mistakes.length})
                  </h3>
                  {teams[tIdx].mistakes.length === 0 ? (
                    <p className="text-sm font-bold text-emerald-700">علامة كاملة — بلا أخطاء!</p>
                  ) : (
                    <ul className="space-y-2.5 text-sm">
                      {teams[tIdx].mistakes.map((m, mIdx) => (
                        <li key={mIdx} className="rounded-lg border border-slate-200 bg-white p-3">
                          <p className="font-bold text-slate-900">{m.question}</p>
                          <p className="mt-1 text-xs text-rose-700">الإجابة المختارة: {m.userAnswer}</p>
                          <p className="text-xs font-bold text-emerald-700">الصواب: {m.correctAnswer}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleRematch}
                className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
              >
                <RotateCcw className="h-4 w-4" />
                <span>جولة جديدة</span>
              </button>
              <button
                type="button"
                onClick={onExit}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowRight className="h-4 w-4" />
                <span>العودة للرئيسية</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 flex-col min-h-0 md:flex-row">
          {([0, 1] as const).map((tIdx) => {
            const team = teams[tIdx];
            const deck = decks[tIdx];
            const q = deck[team.index];
            const isTeal = tIdx === 0;

            return (
              <React.Fragment key={tIdx}>
                {tIdx === 1 && (
                  <div className="relative flex h-2 shrink-0 items-center justify-center bg-slate-200 md:h-auto md:w-1.5">
                    <span className="z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-xs font-black text-amber-300 shadow">
                      VS
                    </span>
                  </div>
                )}

                <div
                  className={`flex flex-1 flex-col gap-3 overflow-y-auto p-3 sm:p-5 transition-colors duration-200 ${
                    team.verdict === 'ok'
                      ? 'bg-emerald-50'
                      : team.verdict === 'bad'
                      ? 'bg-rose-50'
                      : isTeal
                      ? 'bg-teal-50/35'
                      : 'bg-orange-50/35'
                  }`}
                >
                  {/* Team Header */}
                  <div
                    className={`flex items-center justify-between gap-2 rounded-xl border-2 bg-white px-4 py-2.5 ${
                      isTeal ? 'border-teal-600' : 'border-orange-600'
                    }`}
                  >
                    <span
                      className={`font-display truncate text-base font-black sm:text-lg ${
                        isTeal ? 'text-teal-800' : 'text-orange-800'
                      }`}
                    >
                      {teamNames[tIdx]}
                    </span>
                    <div className="flex items-center gap-3 tabular-nums shrink-0">
                      <span className="text-xs font-bold text-slate-500">
                        {team.index + 1} / {deck.length}
                      </span>
                      <span
                        className={`rounded-lg px-2.5 py-0.5 text-lg font-black text-white ${
                          isTeal ? 'bg-teal-700' : 'bg-orange-600'
                        }`}
                      >
                        {team.score}
                      </span>
                    </div>
                  </div>

                  {team.finished ? (
                    <div className="my-auto rounded-2xl border border-slate-200 bg-white p-6 text-center">
                      <Clock className="mx-auto h-10 w-10 text-teal-600" />
                      <h3 className="font-display mt-3 text-xl font-black text-slate-900">
                        أنهى {teamNames[tIdx]} جميع الأسئلة
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-slate-500">
                        في انتظار انتهاء الفريق المنافس لعرض النتيجة النهائية...
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Timer Bar */}
                      <div className="flex items-center gap-2.5 tabular-nums">
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                          <div
                            className={`h-full transition-all duration-100 ${
                              team.timeLeft <= 4
                                ? 'bg-rose-500'
                                : isTeal
                                ? 'bg-teal-600'
                                : 'bg-orange-500'
                            }`}
                            style={{ width: `${(team.timeLeft / QUESTION_TIME) * 100}%` }}
                          />
                        </div>
                        <span
                          className={`min-w-[42px] rounded-lg px-2 py-0.5 text-center text-xs font-black text-white ${
                            team.timeLeft <= 4 ? 'bg-rose-600' : 'bg-slate-800'
                          }`}
                        >
                          {Math.ceil(team.timeLeft)}ث
                        </span>
                      </div>

                      {/* Question Box */}
                      <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
                        <p className="font-display text-base font-extrabold leading-relaxed text-slate-900 sm:text-lg">
                          {q.prompt}
                        </p>
                      </div>

                      {/* Optional Compact Map */}
                      {q.type === 'map' && q.continent && (
                        <ContinentMap
                          continent={q.continent}
                          pins={CONTINENTS_ATLAS.find((c) => c.id === q.continent)?.pins ?? []}
                          mode="quiz"
                          activePinId={q.targetPinId}
                          revealed={team.locked}
                          compact
                        />
                      )}

                      {/* Answer Buttons */}
                      <div
                        className={`grid gap-2.5 ${
                          q.type === 'tf' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
                        }`}
                      >
                        {q.options.map((opt, oIdx) => {
                          const isSelected = team.selectedOpt === oIdx;
                          const isRight = oIdx === q.correctIndex;
                          let style = isTeal
                            ? 'bg-teal-700 text-white hover:bg-teal-800 border-teal-800'
                            : 'bg-orange-600 text-white hover:bg-orange-700 border-orange-700';

                          if (team.locked) {
                            if (isRight) {
                              style = 'bg-emerald-600 text-white border-emerald-700';
                            } else if (isSelected) {
                              style = 'bg-rose-600 text-white border-rose-700';
                            } else {
                              style = 'bg-slate-200 text-slate-500 border-slate-200';
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={team.locked}
                              onClick={() => handleAnswer(tIdx, oIdx)}
                              className={`flex min-h-[54px] items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-bold sm:text-base transition-colors ${style}`}
                            >
                              <span>{opt}</span>
                              {team.locked && isRight && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                              {team.locked && isSelected && !isRight && <XCircle className="h-4 w-4 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>

                      {/* Verdict Text */}
                      <div className="min-h-[24px] text-center text-sm font-black">
                        {team.verdict === 'ok' && <span className="text-emerald-700">إجابة صحيحة! +١ نقطة</span>}
                        {team.verdict === 'bad' && (
                          <span className="text-rose-700">
                            {team.timeLeft === 0 ? 'انتهى الوقت!' : 'إجابة خاطئة'}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
};
