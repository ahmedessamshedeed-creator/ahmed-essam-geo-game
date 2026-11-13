import React, { useEffect, useState } from 'react';
import {
  CheckSquare,
  Crosshair,
  HelpCircle,
  MapPin,
  Sparkles,
  Swords,
  User,
  Users,
  Volume2,
  VolumeX,
  Zap,
  Compass,
  X,
} from 'lucide-react';
import { GAME_MODES, GameModeId } from './data/geographyData';
import { BrandEmblem } from './components/BrandEmblem';
import { ContinentAtlas } from './components/ContinentAtlas';
import { GamePlay } from './components/GamePlay';
import { DuelArena } from './components/DuelArena';
import { soundEngine } from './utils/sound';

type ViewState = 'home' | 'atlas' | 'solo' | 'duel';

interface BestScores {
  [key: string]: { score: number; total: number };
}

const MODE_ICONS: Record<GameModeId, React.ReactNode> = {
  mcq: <HelpCircle className="h-6 w-6 text-teal-700" />,
  tf: <CheckSquare className="h-6 w-6 text-teal-700" />,
  maps: <MapPin className="h-6 w-6 text-teal-700" />,
  genius: <Zap className="h-6 w-6 text-amber-600" />,
  bubbles: <Sparkles className="h-6 w-6 text-sky-600" />,
  shooting: <Crosshair className="h-6 w-6 text-orange-600" />,
};

export default function App() {
  const [view, setView] = useState<ViewState>('home');
  const [activeMode, setActiveMode] = useState<GameModeId>('mcq');
  const [modalMode, setModalMode] = useState<GameModeId | null>(null);
  const [playType, setPlayType] = useState<'solo' | 'duel'>('solo');
  const [team1, setTeam1] = useState('فريق الصقور');
  const [team2, setTeam2] = useState('فريق النمور');
  const [muted, setMuted] = useState(false);

  const [bestScores, setBestScores] = useState<BestScores>(() => {
    try {
      const saved = localStorage.getItem('new_world_scores_v1');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('new_world_scores_v1', JSON.stringify(bestScores));
    } catch {
      // ignore storage errors
    }
  }, [bestScores]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    soundEngine.muted = next;
    if (!next) soundEngine.playClick();
  };

  const handleOpenModeModal = (modeId: GameModeId, defaultType: 'solo' | 'duel' = 'solo') => {
    soundEngine.playClick();
    setModalMode(modeId);
    setPlayType(defaultType);
  };

  const handleLaunchGame = () => {
    if (!modalMode) return;
    soundEngine.playClick();
    setActiveMode(modalMode);
    setModalMode(null);
    setView(playType === 'duel' ? 'duel' : 'solo');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteScore = (mode: GameModeId, score: number, total: number) => {
    setBestScores((prev) => {
      const existing = prev[mode];
      if (!existing || score > existing.score) {
        return { ...prev, [mode]: { score, total } };
      }
      return prev;
    });
  };

  // Fullscreen Split Duel View
  if (view === 'duel') {
    return (
      <DuelArena
        mode={activeMode}
        teamNames={[team1.trim() || 'الفريق الأول', team2.trim() || 'الفريق الثاني']}
        onExit={() => setView('home')}
      />
    );
  }

  return (
    <div className="bg-cartographic flex min-h-screen flex-col text-slate-900">
      {/* 3-Zone Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setView('home');
            }}
            className="font-display text-lg font-black tracking-tight text-teal-900 whitespace-nowrap shrink-0"
          >
            درس × لعبة
          </button>

          {/* Zone 2: Clean Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-slate-600">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setView('home');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-teal-800 ${
                view === 'home' ? 'text-teal-800 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              الرئيسية
            </button>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setView('atlas');
              }}
              className={`whitespace-nowrap shrink-0 transition-colors hover:text-teal-800 ${
                view === 'atlas' ? 'text-teal-800 underline underline-offset-8 decoration-2' : ''
              }`}
            >
              أطلس القارات
            </button>
            <button
              type="button"
              onClick={() => handleOpenModeModal('maps', 'solo')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-teal-800"
            >
              تحدي الخرائط
            </button>
            <button
              type="button"
              onClick={() => handleOpenModeModal('mcq', 'duel')}
              className="whitespace-nowrap shrink-0 transition-colors hover:text-teal-800"
            >
              منافسة الفريقين
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <button
            type="button"
            onClick={() => handleOpenModeModal('mcq', 'solo')}
            className="rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0 sm:text-sm"
          >
            ابدأ التحدي
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {view === 'solo' ? (
          <GamePlay
            mode={activeMode}
            onExit={() => setView('home')}
            onCompleteScore={handleCompleteScore}
          />
        ) : view === 'atlas' ? (
          <ContinentAtlas onStartQuizFromAtlas={() => handleOpenModeModal('maps', 'solo')} />
        ) : (
          <>
            {/* Hero Section */}
            <section className="border-b border-slate-200 bg-gradient-to-b from-teal-950 via-teal-900 to-teal-800 text-white">
              <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 lg:grid-cols-12 lg:py-14">
                <div className="lg:col-span-8">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-teal-200 sm:text-sm">
                    <span>الصف الثالث الإعدادي</span>
                    <span aria-hidden="true">·</span>
                    <span>الوحدة الأولى</span>
                    <span aria-hidden="true">·</span>
                    <span>الدرس الأول</span>
                  </div>

                  <h1 className="font-display mt-3 text-3xl font-black leading-tight text-white sm:text-4xl lg:text-5xl [text-wrap:balance]">
                    موقع ومظاهر سطح قارات العالم الجديد
                  </h1>

                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-teal-100 sm:text-lg">
                    مع الأستاذ <strong className="font-extrabold text-amber-300">أحمد نورالدين</strong> —
                    تدرّب على خرائط أمريكا الشمالية والجنوبية وأستراليا والقارة القطبية الجنوبية عبر
                    ٦ أنماط تفاعلية ومنافسات مباشرة بين فريقين.
                  </p>

                  <div className="mt-6 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleOpenModeModal('maps', 'solo')}
                      className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-extrabold text-slate-950 hover:bg-amber-400 transition-colors"
                    >
                      <Compass className="h-4 w-4" />
                      <span>ادخل تحدي الخرائط</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setView('atlas');
                      }}
                      className="inline-flex items-center gap-2 rounded-xl border border-teal-400/40 bg-teal-950/50 px-5 py-3 text-sm font-bold text-white hover:bg-teal-900 transition-colors"
                    >
                      <span>استكشف أطلس القارات</span>
                    </button>

                    <button
                      type="button"
                      onClick={toggleMute}
                      aria-label={muted ? 'تشغيل المؤثرات الصوتية' : 'كتم المؤثرات الصوتية'}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-teal-400/30 bg-teal-950/40 px-3.5 py-3 text-xs font-bold text-teal-100 hover:bg-teal-900 transition-colors"
                    >
                      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      <span>{muted ? 'الصوت مكتوم' : 'الصوت مفعل'}</span>
                    </button>
                  </div>
                </div>

                {/* Teacher Crest Card */}
                <div className="flex justify-center lg:col-span-4 lg:justify-end">
                  <div className="flex w-full max-w-xs flex-col items-center rounded-2xl border border-teal-700/60 bg-teal-950/60 p-6 text-center">
                    <BrandEmblem className="h-24 w-24" />
                    <h2 className="font-display mt-4 text-xl font-black text-white">
                      الأستاذ أحمد نورالدين
                    </h2>
                    <p className="mt-1 text-sm font-medium text-teal-200">
                      مادة الدراسات الاجتماعية
                    </p>
                    <p className="mt-3 text-xs text-teal-300/90">
                      تصميم وبرمجة: المبرمج أحمد عصام
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Mobile Quick Switcher (shown under hero on small screens) */}
            <div className="mx-auto flex max-w-6xl gap-2 px-4 pt-5 md:hidden">
              <button
                type="button"
                onClick={() => setView('atlas')}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-800"
              >
                أطلس القارات
              </button>
              <button
                type="button"
                onClick={() => handleOpenModeModal('mcq', 'duel')}
                className="flex-1 rounded-xl border border-amber-300 bg-amber-50 py-2.5 text-sm font-bold text-amber-900"
              >
                منافسة فريقين
              </button>
            </div>

            {/* Game Modes Grid */}
            <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
              <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-bold text-teal-700">أنماط التعلّم واللعب</p>
                  <h2 className="font-display mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                    اختر التحدي المناسب لك
                  </h2>
                </div>
                <p className="text-sm text-slate-500">
                  يمكنك اللعب فردياً أو التحدي في شاشة مقسومة بين فريقين
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {GAME_MODES.map((mode) => {
                  const best = bestScores[mode.id];
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => handleOpenModeModal(mode.id, 'solo')}
                      className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-6 text-right transition-transform duration-150 hover:-translate-y-1 hover:border-teal-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 border border-teal-100">
                            {MODE_ICONS[mode.id]}
                          </div>
                          <span className="text-xs font-semibold text-slate-400 tabular-nums">
                            {mode.questionCount} أسئلة
                          </span>
                        </div>

                        <h3 className="font-display mt-4 text-xl font-extrabold text-slate-900 group-hover:text-teal-800">
                          {mode.title}
                        </h3>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                          {mode.subtitle}
                        </p>
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3.5 text-xs font-bold">
                        <span className="text-teal-700">اضغط للبدء</span>
                        {best ? (
                          <span className="text-emerald-700 tabular-nums">
                            أفضل نتيجة: {best.score}/{best.total}
                          </span>
                        ) : (
                          <span className="text-slate-400">
                            {mode.supportsDuel ? 'يدعم اللعب الفردي والفريقين' : 'تحدي فردي تفاعلي'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 py-7 text-center text-slate-300">
        <div className="mx-auto max-w-6xl px-4">
          <p className="font-display text-base font-bold text-white">
            منصة الدراسات الاجتماعية — الصف الثالث الإعدادي
          </p>
          <p className="mt-1 text-sm text-slate-400">
            إشراف الأستاذ أحمد نورالدين · تصميم وبرمجة الموقع: المبرمج أحمد عصام
          </p>
        </div>
      </footer>

      {/* Mode Selection Modal (Solo vs 2-Team Split Duel) */}
      {modalMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-teal-700">إعداد الجولة</p>
                <h2 className="font-display mt-0.5 text-xl font-black text-slate-900">
                  {GAME_MODES.find((m) => m.id === modalMode)?.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                aria-label="إغلاق النافذة"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-2 text-sm text-slate-600">اختر طريقة اللعب المناسبة:</p>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPlayType('solo');
                }}
                className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-colors ${
                  playType === 'solo'
                    ? 'border-teal-700 bg-teal-50 text-teal-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <User className="h-7 w-7 text-teal-700" />
                <span className="font-display mt-2 text-base font-extrabold">لعب فردي</span>
                <span className="mt-0.5 text-xs text-slate-500">اختبر مستواك وراجع أخطاءك</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  setPlayType('duel');
                }}
                className={`flex flex-col items-center rounded-xl border-2 p-4 text-center transition-colors ${
                  playType === 'duel'
                    ? 'border-orange-600 bg-orange-50 text-orange-950'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <Users className="h-7 w-7 text-orange-600" />
                <span className="font-display mt-2 text-base font-extrabold">منافسة فريقين</span>
                <span className="mt-0.5 text-xs text-slate-500">شاشة مقسومة وتحدي مباشر</span>
              </button>
            </div>

            {playType === 'duel' && (
              <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div>
                  <label className="block text-xs font-bold text-teal-800 mb-1">اسم الفريق الأول</label>
                  <input
                    type="text"
                    value={team1}
                    onChange={(e) => setTeam1(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-center text-sm font-bold text-slate-900 focus:border-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-orange-800 mb-1">اسم الفريق الثاني</label>
                  <input
                    type="text"
                    value={team2}
                    onChange={(e) => setTeam2(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-center text-sm font-bold text-slate-900 focus:border-orange-600 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleLaunchGame}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-extrabold text-white hover:bg-teal-800 transition-colors"
              >
                {playType === 'duel' ? <Swords className="h-4 w-4" /> : null}
                <span>{playType === 'duel' ? 'بدء المنافسة الآن' : 'بدء التحدي'}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
