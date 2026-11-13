import React, { useState } from 'react';
import { BookOpen, Compass, Mountain, Layers, Waves, ArrowRight } from 'lucide-react';
import { CONTINENTS_ATLAS, ContinentKey, MapFeaturePin } from '../data/geographyData';
import { ContinentMap } from './ContinentMaps';
import { soundEngine } from '../utils/sound';

interface ContinentAtlasProps {
  onStartQuizFromAtlas: () => void;
}

export const ContinentAtlas: React.FC<ContinentAtlasProps> = ({ onStartQuizFromAtlas }) => {
  const [selectedId, setSelectedId] = useState<ContinentKey>('north_america');
  const current = CONTINENTS_ATLAS.find((c) => c.id === selectedId) ?? CONTINENTS_ATLAS[0];
  const [activePin, setActivePin] = useState<MapFeaturePin | null>(current.pins[0] ?? null);

  const handleSelectContinent = (id: ContinentKey) => {
    soundEngine.playClick();
    setSelectedId(id);
    const next = CONTINENTS_ATLAS.find((c) => c.id === id);
    setActivePin(next?.pins[0] ?? null);
  };

  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-teal-700">مراجعة الدرس والخرائط</p>
          <h2 className="font-display mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl">
            أطلس قارات العالم الجديد التفاعلي
          </h2>
        </div>

        {/* Continent Switcher Tabs */}
        <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
          {CONTINENTS_ATLAS.map((continent) => {
            const active = continent.id === selectedId;
            return (
              <button
                key={continent.id}
                type="button"
                onClick={() => handleSelectContinent(continent.id)}
                className={`rounded-lg px-3.5 py-2 text-sm font-bold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-teal-700 text-white'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {continent.name.replace('قارة ', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Zone Interactive Educational Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Interactive Map Stage (7 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-7">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-display text-xl font-extrabold text-slate-900">{current.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                <span>المساحة: {current.areaMillionKm2}</span>
                <span aria-hidden="true">·</span>
                <span>{current.rank}</span>
              </div>
            </div>
            <Compass className="h-6 w-6 text-teal-700 shrink-0" />
          </div>

          <ContinentMap
            continent={current.id}
            pins={current.pins}
            mode="atlas"
            activePinId={activePin?.id}
            onSelectPin={(pin) => {
              soundEngine.playClick();
              setActivePin(pin);
            }}
          />

          {/* Selected Pin Inspector */}
          {activePin && (
            <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50/70 p-4">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-display text-base font-extrabold text-teal-950">
                  {activePin.label}
                </h4>
                <span className="text-xs font-semibold text-teal-800">{activePin.category}</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">{activePin.note}</p>
            </div>
          )}
        </div>

        {/* Structured Study Deck (5 cols) */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-5">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <BookOpen className="h-4 w-4 text-teal-700" />
              <span>الموقع الفلكي والجغرافي</span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{current.astronomicalLocation}</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="block font-bold text-slate-500">شمالاً</span>
                <span className="mt-0.5 block font-semibold text-slate-800">{current.borders.north}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="block font-bold text-slate-500">جنوباً</span>
                <span className="mt-0.5 block font-semibold text-slate-800">{current.borders.south}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="block font-bold text-slate-500">شرقاً</span>
                <span className="mt-0.5 block font-semibold text-slate-800">{current.borders.east}</span>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                <span className="block font-bold text-slate-500">غرباً</span>
                <span className="mt-0.5 block font-semibold text-slate-800">{current.borders.west}</span>
              </div>
            </div>
          </div>

          <hr className="border-slate-100" />

          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Mountain className="h-4 w-4 text-amber-700" />
              <span>أهم الجبال</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
              {current.mountains.map((m, idx) => (
                <li key={idx}>• {m}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Layers className="h-4 w-4 text-orange-600" />
              <span>أهم الهضاب</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
              {current.plateaus.map((p, idx) => (
                <li key={idx}>• {p}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Waves className="h-4 w-4 text-sky-600" />
              <span>السهول والأنهار</span>
            </div>
            <ul className="mt-1.5 space-y-1 text-sm text-slate-700">
              {current.plainsAndRivers.map((r, idx) => (
                <li key={idx}>• {r}</li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-950">
            <span className="font-extrabold">ملاحظة امتحانية: </span>
            {current.examTip}
          </div>

          <button
            type="button"
            onClick={onStartQuizFromAtlas}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-700 px-5 py-3 text-sm font-bold text-white hover:bg-teal-800 transition-colors"
          >
            <span>اختبر نفسك الآن في الخرائط</span>
            <ArrowRight className="h-4 w-4 rotate-180" />
          </button>
        </div>
      </div>
    </section>
  );
};
