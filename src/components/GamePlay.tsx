import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trophy,
  Clock,
  Share2,
  Copy,
  Check,
  Target,
} from 'lucide-react';
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

interface MistakeRecord {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
}

interface GamePlayProps {
  mode: GameModeId;
  onExit: () => void;
  onCompleteScore?: (mode: GameModeId, score: number, total: number) => void;
}

interface MovingItem {
  optionIndex: number;
  label: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const GENIUS_SECONDS = 12;

export const GamePlay: React.FC<GamePlayProps> = ({ mode, onExit, onCompleteScore }) => {
  const modeMeta = GAME_MODES.find((m) => m.id === mode)!;

  const totalQuestions = useMemo(() => {
    switch (mode) {
      case 'mcq':
        return MCQ_QUESTIONS.length;
      case 'tf':
        return TF_QUESTIONS.length;
      case 'bubbles':
        return BUBBLES_QUESTIONS.length;
      case 'shooting':
        return SHOOTING_QUESTIONS.length;
      case 'genius':
        return GENIUS_QUESTIONS.length;
      case 'maps':
        return MAP_QUESTIONS.length;
    }
  }, [mode]);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [tfSelected, setTfSelected] = useState<boolean | null>(null);
  const [answered, setAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const [shakeTrigger, setShakeTrigger] = useState(false);

  // Genius countdown state
  const [timeLeft, setTimeLeft] = useState(GENIUS_SECONDS);

  // Bubbles / Shooting physics state
  const [movingItems, setMovingItems] = useState<MovingItem[]>([]);
  const animRef = useRef<number | null>(null);

  // Share state
  const [studentName, setStudentName] = useState('');
  const [copied, setCopied] = useState(false);

  // Current question lookup
  const currentMcq =
    mode === 'mcq'
      ? MCQ_QUESTIONS[index]
      : mode === 'bubbles'
      ? BUBBLES_QUESTIONS[index]
      : mode === 'shooting'
      ? SHOOTING_QUESTIONS[index]
      : mode === 'genius'
      ? GENIUS_QUESTIONS[index]
      : null;

  const currentTf = mode === 'tf' ? TF_QUESTIONS[index] : null;
  const currentMap = mode === 'maps' ? MAP_QUESTIONS[index] : null;

  // Initialize moving positions for bubbles & shooting
  useEffect(() => {
    if ((mode !== 'bubbles' && mode !== 'shooting') || finished || !currentMcq) return;

    const initial: MovingItem[] = currentMcq.options.map((label, optIdx) => ({
      optionIndex: optIdx,
      label,
      x: 10 + (optIdx % 2) * 44 + Math.random() * 14,
      y: mode === 'bubbles' ? 62 + Math.floor(optIdx / 2) * 18 : 16 + optIdx * 19,
      vx: (Math.random() > 0.5 ? 1 : -1) * (mode === 'shooting' ? 0.34 : 0.18),
      vy: mode === 'bubbles' ? -(0.16 + Math.random() * 0.14) : (Math.random() - 0.5) * 0.14,
    }));
    setMovingItems(initial);
  }, [mode, index, finished, currentMcq]);

  // Animation loop for bubbles & shooting
  useEffect(() => {
    if ((mode !== 'bubbles' && mode !== 'shooting') || answered || finished) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      return;
    }

    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min((now - last) / 16.67, 2.5);
      last = now;

      setMovingItems((prev) =>
        prev.map((item) => {
          let nx = item.x + item.vx * dt;
          let ny = item.y + item.vy * dt;
          let nvx = item.vx;
          let nvy = item.vy;

          if (nx < 4) {
            nx = 4;
            nvx = Math.abs(nvx);
          } else if (nx > 68) {
            nx = 68;
            nvx = -Math.abs(nvx);
          }

          if (mode === 'bubbles') {
            if (ny < 6) {
              ny = 82;
            }
          } else {
            if (ny < 8) {
              ny = 8;
              nvy = Math.abs(nvy);
            } else if (ny > 78) {
              ny = 78;
              nvy = -Math.abs(nvy);
            }
          }

          return { ...item, x: nx, y: ny, vx: nvx, vy: nvy };
        })
      );

      animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [mode, answered, finished]);

  // Genius countdown timer
  useEffect(() => {
    if (mode !== 'genius' || answered || finished) return;
    setTimeLeft(GENIUS_SECONDS);

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          window.clearInterval(interval);
          handleGeniusTimeout();
          return 0;
        }
        return Number((prev - 0.1).toFixed(1));
      });
    }, 100);

    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, index, answered, finished]);

  const triggerShake = () => {
    setShakeTrigger(true);
    window.setTimeout(() => setShakeTrigger(false), 400);
  };

  const handleGeniusTimeout = () => {
    if (answered || !currentMcq) return;
    soundEngine.playWrong();
    triggerShake();
    setAnswered(true);
    setIsCorrect(false);
    setTimedOut(true);
    setMistakes((prev) => [
      ...prev,
      {
        question: currentMcq.prompt,
        userAnswer: 'انتهى الوقت قبل الاختيار',
        correctAnswer: currentMcq.options[currentMcq.correctIndex],
        explanation: currentMcq.explanation,
      },
    ]);
  };

  const handleChoiceSelect = (choiceIdx: number) => {
    if (answered) return;

    if (mode === 'maps' && currentMap) {
      const ok = choiceIdx === currentMap.correctIndex;
      setSelectedChoice(choiceIdx);
      setAnswered(true);
      setIsCorrect(ok);
      if (ok) {
        soundEngine.playCorrect();
        setScore((s) => s + 1);
      } else {
        soundEngine.playWrong();
        triggerShake();
        setMistakes((prev) => [
          ...prev,
          {
            question: currentMap.prompt,
            userAnswer: currentMap.options[choiceIdx],
            correctAnswer: currentMap.options[currentMap.correctIndex],
            explanation: currentMap.explanation,
          },
        ]);
      }
      return;
    }

    if (currentMcq) {
      const ok = choiceIdx === currentMcq.correctIndex;
      setSelectedChoice(choiceIdx);
      setAnswered(true);
      setIsCorrect(ok);
      if (ok) {
        soundEngine.playCorrect();
        setScore((s) => s + 1);
      } else {
        soundEngine.playWrong();
        triggerShake();
        setMistakes((prev) => [
          ...prev,
          {
            question: currentMcq.prompt,
            userAnswer: currentMcq.options[choiceIdx],
            correctAnswer: currentMcq.options[currentMcq.correctIndex],
            explanation: currentMcq.explanation,
          },
        ]);
      }
    }
  };

  const handleTfSelect = (val: boolean) => {
    if (answered || !currentTf) return;
    const ok = val === currentTf.isTrue;
    setTfSelected(val);
    setAnswered(true);
    setIsCorrect(ok);
    if (ok) {
      soundEngine.playCorrect();
      setScore((s) => s + 1);
    } else {
      soundEngine.playWrong();
      triggerShake();
      setMistakes((prev) => [
        ...prev,
        {
          question: currentTf.statement,
          userAnswer: val ? 'صواب' : 'خطأ',
          correctAnswer: currentTf.isTrue ? 'صواب' : 'خطأ',
          explanation: currentTf.explanation,
        },
      ]);
    }
  };

  const handleNext = () => {
    soundEngine.playClick();
    if (index + 1 >= totalQuestions) {
      setFinished(true);
      onCompleteScore?.(mode, score, totalQuestions);
      if (score / totalQuestions >= 0.7) {
        soundEngine.playVictory();
      }
    } else {
      setIndex((i) => i + 1);
      setSelectedChoice(null);
      setTfSelected(null);
      setAnswered(false);
      setIsCorrect(false);
      setTimedOut(false);
    }
  };

  const handleRestart = () => {
    soundEngine.playClick();
    setIndex(0);
    setScore(0);
    setSelectedChoice(null);
    setTfSelected(null);
    setAnswered(false);
    setIsCorrect(false);
    setTimedOut(false);
    setMistakes([]);
    setFinished(false);
  };

  // Summary screen
  if (finished) {
    const pct = Math.round((score / totalQuestions) * 100);
    const gradeLabel =
      pct >= 90 ? 'ممتاز — تفوق باهر' : pct >= 70 ? 'جيد جداً — أحسنت' : pct >= 50 ? 'جيد — واصل التدريب' : 'تحتاج لمراجعة الدرس';
    const shareMessage = `حصل الطالب (${studentName.trim() || 'بطل الدراسات'}) على ${score} من ${totalQuestions} (${pct}%) في ${modeMeta.title} — درس موقع ومظاهر سطح قارات العالم الجديد مع الأستاذ أحمد نورالدين.`;
    const whatsappHref = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

    const handleCopy = async () => {
      try {
        await navigator.clipboard.writeText(shareMessage);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } catch {
        // Clipboard unavailable
      }
    };

    return (
      <div className="relative mx-auto w-full max-w-4xl px-4 py-8">
        {/* Confetti on good score */}
        {pct >= 70 && (
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <span
                key={i}
                className="animate-confetti absolute top-0 h-3 w-2.5 rounded-sm"
                style={{
                  left: `${(i * 4.2) % 98}%`,
                  backgroundColor: ['#0D9488', '#F59E0B', '#10B981', '#0284C7'][i % 4],
                  animationDuration: `${2.2 + (i % 5) * 0.45}s`,
                  animationDelay: `${(i % 6) * 0.12}s`,
                }}
              />
            ))}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 text-teal-700 border border-teal-100">
            <Trophy className="h-8 w-8" />
          </div>

          <p className="text-sm font-semibold text-teal-700">{modeMeta.title}</p>
          <h2 className="font-display mt-1 text-2xl font-black text-slate-900 sm:text-3xl">{gradeLabel}</h2>

          <div className="mx-auto mt-6 grid max-w-md grid-cols-3 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 tabular-nums">
            <div>
              <span className="block text-xs font-medium text-slate-500">الدرجة</span>
              <span className="font-display text-2xl font-black text-teal-700">
                {score} / {totalQuestions}
              </span>
            </div>
            <div className="border-x border-slate-200">
              <span className="block text-xs font-medium text-slate-500">النسبة المئوية</span>
              <span className="font-display text-2xl font-black text-slate-900">{pct}%</span>
            </div>
            <div>
              <span className="block text-xs font-medium text-slate-500">الأخطاء</span>
              <span className="font-display text-2xl font-black text-rose-600">{mistakes.length}</span>
            </div>
          </div>

          {/* Share Box */}
          <div className="mx-auto mt-6 max-w-lg rounded-xl border border-teal-200 bg-teal-50/50 p-5">
            <h3 className="font-display text-base font-extrabold text-slate-900">مشاركة النتيجة مع الأستاذ أو ولي الأمر</h3>
            <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="اكتب اسمك هنا (اختياري)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 focus:border-teal-600 focus:outline-none"
              />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 transition-colors whitespace-nowrap shrink-0"
              >
                <Share2 className="h-4 w-4" />
                <span>إرسال عبر واتساب</span>
              </a>
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
              </button>
            </div>
          </div>

          {/* Mistakes Review */}
          {mistakes.length > 0 ? (
            <div className="mt-7 text-right">
              <h3 className="font-display mb-3 text-lg font-extrabold text-slate-900">
                مراجعة الأخطاء والتصويب ({mistakes.length})
              </h3>
              <div className="max-h-80 space-y-3 overflow-y-auto pl-1">
                {mistakes.map((m, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <p className="font-bold text-slate-900">{m.question}</p>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span className="font-semibold text-rose-700">إجابتك: {m.userAnswer}</span>
                      <span className="font-bold text-emerald-700">الإجابة الصحيحة: {m.correctAnswer}</span>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-600">{m.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-900">
              أجبت عن جميع الأسئلة إجابة صحيحة دون أي أخطاء. عمل رائع!
            </div>
          )}

          {/* Actions */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRestart}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>إعادة التحدي</span>
            </button>
            <button
              type="button"
              onClick={onExit}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
              <span>العودة لقائمة الألعاب</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Gameplay Header HUD
  const currentExplanation =
    currentMcq?.explanation || currentTf?.explanation || currentMap?.explanation || '';

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6">
      {/* Unobtrusive Top HUD */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <ArrowRight className="h-4 w-4" />
          <span>خروج</span>
        </button>

        <div className="text-center">
          <h2 className="font-display text-base font-extrabold text-slate-900 sm:text-lg">{modeMeta.title}</h2>
        </div>

        <div className="flex items-center gap-4 text-sm font-bold tabular-nums">
          <span className="text-slate-600">
            السؤال {index + 1} من {totalQuestions}
          </span>
          <span className="text-teal-700">النقاط: {score}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full bg-teal-600 transition-all duration-300"
          style={{ width: `${((index + (answered ? 1 : 0)) / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-7 ${shakeTrigger ? 'animate-shake' : ''}`}>
        {/* Genius Timer */}
        {mode === 'genius' && (
          <div className="mb-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-bold tabular-nums">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Clock className="h-4 w-4 text-amber-600" />
                <span>الوقت المتبقي</span>
              </span>
              <span className={timeLeft <= 4 ? 'text-rose-600' : 'text-teal-700'}>
                {Math.ceil(timeLeft)} ثانية
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full transition-all duration-100 ${
                  timeLeft <= 4 ? 'bg-rose-500' : 'bg-teal-600'
                }`}
                style={{ width: `${(timeLeft / GENIUS_SECONDS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Question Prompt */}
        <h3 className="font-display text-center text-lg font-extrabold leading-relaxed text-slate-900 sm:text-2xl">
          {currentMcq?.prompt || currentTf?.statement || currentMap?.prompt}
        </h3>

        {/* Mode-Specific Play Area */}
        <div className="mt-6">
          {/* 1. MCQ & GENIUS */}
          {(mode === 'mcq' || mode === 'genius') && currentMcq && (
            <div className={`grid gap-3 ${mode === 'genius' ? 'sm:grid-cols-2' : 'grid-cols-1'}`}>
              {currentMcq.options.map((opt, optIdx) => {
                const isSelected = selectedChoice === optIdx;
                const isRight = optIdx === currentMcq.correctIndex;
                let style = 'border-slate-200 bg-slate-50 text-slate-800 hover:border-teal-500 hover:bg-teal-50/60';
                if (answered) {
                  if (isRight) {
                    style = 'border-emerald-600 bg-emerald-50 text-emerald-950';
                  } else if (isSelected) {
                    style = 'border-rose-500 bg-rose-50 text-rose-950';
                  } else {
                    style = 'border-slate-200 bg-slate-50 text-slate-400 opacity-75';
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    disabled={answered}
                    onClick={() => handleChoiceSelect(optIdx)}
                    className={`flex min-h-[56px] items-center justify-between gap-3 rounded-xl border-2 px-5 py-3.5 text-right text-base font-bold transition-colors ${style}`}
                  >
                    <span>{opt}</span>
                    {answered && isRight && <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />}
                    {answered && isSelected && !isRight && <XCircle className="h-5 w-5 shrink-0 text-rose-600" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. TRUE / FALSE */}
          {mode === 'tf' && currentTf && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                { val: true, label: 'صواب (العبارة صحيحة)' },
                { val: false, label: 'خطأ (العبارة غير صحيحة)' },
              ].map((btn) => {
                const isSelected = tfSelected === btn.val;
                const isRight = currentTf.isTrue === btn.val;
                let style =
                  btn.val
                    ? 'border-slate-200 bg-slate-50 text-slate-900 hover:border-emerald-600 hover:bg-emerald-50'
                    : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-rose-600 hover:bg-rose-50';

                if (answered) {
                  if (isRight) {
                    style = 'border-emerald-600 bg-emerald-600 text-white';
                  } else if (isSelected) {
                    style = 'border-rose-600 bg-rose-600 text-white';
                  } else {
                    style = 'border-slate-200 bg-slate-100 text-slate-400';
                  }
                }

                return (
                  <button
                    key={String(btn.val)}
                    type="button"
                    disabled={answered}
                    onClick={() => handleTfSelect(btn.val)}
                    className={`flex min-h-[76px] items-center justify-center gap-3 rounded-xl border-2 px-6 py-4 text-lg font-extrabold transition-colors ${style}`}
                  >
                    {btn.val ? <CheckCircle2 className="h-6 w-6 shrink-0" /> : <XCircle className="h-6 w-6 shrink-0" />}
                    <span>{btn.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 3. BUBBLES */}
          {mode === 'bubbles' && currentMcq && (
            <div className="relative h-80 w-full overflow-hidden rounded-2xl border-2 border-teal-700 bg-gradient-to-b from-teal-950 to-teal-800">
              {movingItems.map((item) => {
                const isSelected = selectedChoice === item.optionIndex;
                const isRight = item.optionIndex === currentMcq.correctIndex;
                let bubbleStyle =
                  'bg-white/95 text-teal-950 border-teal-200 hover:scale-105';
                if (answered) {
                  if (isRight) bubbleStyle = 'bg-emerald-500 text-white border-white scale-105';
                  else if (isSelected) bubbleStyle = 'bg-rose-500 text-white border-white';
                  else bubbleStyle = 'bg-white/40 text-white border-white/30';
                }

                return (
                  <button
                    key={item.optionIndex}
                    type="button"
                    disabled={answered}
                    onClick={() => handleChoiceSelect(item.optionIndex)}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    className={`absolute flex min-h-[48px] min-w-[110px] max-w-[155px] items-center justify-center rounded-full border-2 px-4 py-2 text-center text-sm font-extrabold shadow-md transition-colors ${bubbleStyle}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}

          {/* 4. SHOOTING */}
          {mode === 'shooting' && currentMcq && (
            <div className="relative h-80 w-full overflow-hidden rounded-2xl border-2 border-sky-700 bg-gradient-to-b from-sky-100 via-sky-50 to-teal-50 cursor-crosshair">
              {movingItems.map((item) => {
                const isSelected = selectedChoice === item.optionIndex;
                const isRight = item.optionIndex === currentMcq.correctIndex;
                let targetStyle =
                  'bg-white text-slate-900 border-amber-500 hover:bg-amber-50';
                if (answered) {
                  if (isRight) targetStyle = 'bg-emerald-600 text-white border-emerald-800';
                  else if (isSelected) targetStyle = 'bg-rose-600 text-white border-rose-800';
                  else targetStyle = 'bg-white/60 text-slate-400 border-slate-300';
                }

                return (
                  <button
                    key={item.optionIndex}
                    type="button"
                    disabled={answered}
                    onClick={() => handleChoiceSelect(item.optionIndex)}
                    style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    className={`absolute inline-flex min-h-[46px] items-center gap-2 rounded-xl border-2 px-4 py-2 text-sm font-extrabold shadow-sm cursor-crosshair transition-colors ${targetStyle}`}
                  >
                    <Target className="h-4 w-4 shrink-0" />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* 5. INTERACTIVE MAPS */}
          {mode === 'maps' && currentMap && (
            <div className="space-y-5">
              <ContinentMap
                continent={currentMap.continent}
                pins={CONTINENTS_ATLAS.find((c) => c.id === currentMap.continent)?.pins ?? []}
                mode="quiz"
                activePinId={currentMap.targetPinId}
                revealed={answered}
              />

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {currentMap.options.map((opt, optIdx) => {
                  const isSelected = selectedChoice === optIdx;
                  const isRight = optIdx === currentMap.correctIndex;
                  let style =
                    'border-slate-200 bg-slate-50 text-slate-900 hover:border-teal-600 hover:bg-teal-50';
                  if (answered) {
                    if (isRight) style = 'border-emerald-600 bg-emerald-600 text-white';
                    else if (isSelected) style = 'border-rose-600 bg-rose-600 text-white';
                    else style = 'border-slate-200 bg-slate-100 text-slate-400';
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      disabled={answered}
                      onClick={() => handleChoiceSelect(optIdx)}
                      className={`flex min-h-[54px] items-center justify-between gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold sm:text-base transition-colors ${style}`}
                    >
                      <span>{opt}</span>
                      {answered && isRight && <CheckCircle2 className="h-5 w-5 shrink-0" />}
                      {answered && isSelected && !isRight && <XCircle className="h-5 w-5 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Educational Feedback & Next Step */}
        {answered && (
          <div
            className={`mt-6 flex flex-col justify-between gap-4 rounded-xl border p-4 sm:flex-row sm:items-center ${
              isCorrect
                ? 'border-emerald-200 bg-emerald-50 text-emerald-950'
                : 'border-rose-200 bg-rose-50 text-rose-950'
            }`}
          >
            <div>
              <p className="font-display text-base font-black">
                {isCorrect ? 'إجابة صحيحة — أحسنت!' : timedOut ? 'انتهى الوقت المحدد' : 'إجابة غير صحيحة'}
              </p>
              <p className="mt-1 text-sm leading-relaxed opacity-90">{currentExplanation}</p>
            </div>
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
            >
              <span>{index + 1 >= totalQuestions ? 'عرض النتيجة النهائية' : 'السؤال التالي'}</span>
              <ArrowRight className="h-4 w-4 rotate-180" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
