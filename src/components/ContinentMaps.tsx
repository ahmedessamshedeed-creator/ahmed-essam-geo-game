import React, { useState } from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { ContinentKey, MapFeaturePin } from '../data/geographyData';

interface ContinentMapProps {
  continent: ContinentKey;
  pins: MapFeaturePin[];
  mode: 'atlas' | 'quiz';
  activePinId?: string | null;
  revealed?: boolean;
  onSelectPin?: (pin: MapFeaturePin) => void;
  compact?: boolean;
}

export const ContinentMap: React.FC<ContinentMapProps> = ({
  continent,
  pins,
  mode,
  activePinId,
  revealed = false,
  onSelectPin,
  compact = false,
}) => {
  const [zoomed, setZoomed] = useState(false);

  const renderSilhouette = () => {
    switch (continent) {
      case 'north_america':
        return (
          <g>
            {/* Ocean labels */}
            <text x="14" y="14" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط القطبي الشمالي</text>
            <text x="8" y="64" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط الهادي</text>
            <text x="78" y="66" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط الأطلنطي</text>
            <text x="53" y="83" className="fill-sky-700/80 text-[3px] font-bold">خليج المكسيك</text>

            {/* Continent landmass */}
            <path
              d="M15,24 L28,18 L43,16 L58,15 L72,19 L82,27 L86,34 L77,42 L72,48 L67,56 L62,64 L53,67 L45,71 L43,79 L48,86 L43,89 L35,83 L29,74 L25,62 L21,49 L16,37 L11,30 Z"
              fill="#D1FAE5"
              stroke="#0F766E"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Hudson Bay cutout */}
            <path
              d="M52,24 L61,23 L64,31 L58,36 L51,32 Z"
              fill="#E0F2FE"
              stroke="#0F766E"
              strokeWidth="0.7"
            />
            {/* Greenland hint */}
            <path
              d="M72,9 L84,8 L88,16 L79,20 L71,16 Z"
              fill="#E2E8F0"
              stroke="#64748B"
              strokeWidth="0.7"
            />
            {/* Rocky mountains ridge marks */}
            <path d="M23,31 L26,27 L29,31 M25,40 L28,36 L31,40 M27,50 L30,46 L33,50" stroke="#B45309" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            {/* Appalachian ridge marks */}
            <path d="M72,48 L75,44 L78,48 M69,54 L72,50 L75,54" stroke="#B45309" strokeWidth="1" fill="none" strokeLinecap="round" />
            {/* Mississippi river line */}
            <path d="M54,43 Q57,53 55,66" stroke="#0284C7" strokeWidth="1.2" fill="none" strokeLinecap="round" />
            {/* St Lawrence river */}
            <path d="M64,43 Q70,41 76,38" stroke="#0284C7" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'south_america':
        return (
          <g>
            <text x="38" y="10" className="fill-sky-700/75 text-[3.4px] font-bold">البحر الكاريبي</text>
            <text x="6" y="54" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط الهادي</text>
            <text x="74" y="34" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط الأطلنطي</text>

            {/* Continent landmass */}
            <path
              d="M27,16 L43,13 L59,17 L74,26 L84,36 L81,49 L71,60 L60,70 L49,81 L42,91 L35,90 L31,79 L26,64 L22,49 L19,35 L22,23 Z"
              fill="#D1FAE5"
              stroke="#0F766E"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Andes ridge */}
            <path
              d="M22,29 L25,25 L28,29 M21,41 L24,37 L27,41 M23,54 L26,50 L29,54 M28,68 L31,64 L34,68"
              stroke="#B45309"
              strokeWidth="1.15"
              fill="none"
              strokeLinecap="round"
            />
            {/* Amazon River */}
            <path d="M27,34 Q46,35 67,31" stroke="#0284C7" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            {/* Parana / La Plata */}
            <path d="M55,54 Q52,65 55,73" stroke="#0284C7" strokeWidth="1.1" fill="none" strokeLinecap="round" />
            {/* Plateau subtle zones */}
            <ellipse cx="70" cy="44" rx="10" ry="7" fill="#FDE68A" fillOpacity="0.45" stroke="#D97706" strokeWidth="0.6" strokeDasharray="2 2" />
            <ellipse cx="47" cy="19" rx="8" ry="4" fill="#FDE68A" fillOpacity="0.45" stroke="#D97706" strokeWidth="0.6" strokeDasharray="2 2" />
            <ellipse cx="37" cy="80" rx="5.5" ry="6" fill="#FDE68A" fillOpacity="0.45" stroke="#D97706" strokeWidth="0.6" strokeDasharray="2 2" />
          </g>
        );

      case 'australia':
        return (
          <g>
            <text x="41" y="10" className="fill-sky-700/75 text-[3.4px] font-bold">بحر أرافورا</text>
            <text x="6" y="45" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط الهندي</text>
            <text x="79" y="34" className="fill-sky-700/75 text-[3.4px] font-bold">المحيط الهادي</text>
            <text x="36" y="75" className="fill-sky-700/75 text-[3px] font-bold">الخليج الأسترالي الكبير</text>

            {/* Australia mainland */}
            <path
              d="M22,36 L34,26 L46,20 L56,24 L61,19 L72,26 L81,40 L83,55 L76,68 L65,73 L55,66 L41,65 L27,68 L17,58 L16,45 Z"
              fill="#D1FAE5"
              stroke="#0F766E"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Tasmania */}
            <path d="M68,80 L76,80 L74,88 L69,87 Z" fill="#D1FAE5" stroke="#0F766E" strokeWidth="1" />
            {/* New Zealand hint */}
            <path d="M90,71 L94,65 L96,74 L91,82 Z" fill="#D1FAE5" stroke="#0F766E" strokeWidth="0.9" />
            {/* Western Plateau */}
            <ellipse cx="33" cy="45" rx="14" ry="13" fill="#FDE68A" fillOpacity="0.4" stroke="#D97706" strokeWidth="0.7" strokeDasharray="2 2" />
            {/* Great Dividing Range */}
            <path d="M75,38 L78,34 L81,38 M77,49 L80,45 L83,49 M74,60 L77,56 L80,60" stroke="#B45309" strokeWidth="1.15" fill="none" strokeLinecap="round" />
            {/* Murray-Darling */}
            <path d="M73,53 Q66,60 61,67" stroke="#0284C7" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          </g>
        );

      case 'antarctica':
        return (
          <g>
            <text x="35" y="13" className="fill-sky-700/80 text-[3.5px] font-bold">المحيط القطبي الجنوبي</text>
            <text x="35" y="91" className="fill-sky-700/80 text-[3.5px] font-bold">المحيط القطبي الجنوبي</text>

            {/* Antarctica ice sheet */}
            <path
              d="M27,36 L38,26 L53,24 L69,28 L79,38 L81,53 L75,67 L61,76 L43,76 L31,68 L22,55 L20,44 Z"
              fill="#F1F5F9"
              stroke="#0F766E"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Latitude circles */}
            <circle cx="50" cy="50" r="14" fill="none" stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="28" fill="none" stroke="#94A3B8" strokeWidth="0.5" strokeDasharray="2 2" />
            {/* Longitude lines converging at South Pole */}
            <line x1="50" y1="20" x2="50" y2="80" stroke="#CBD5E1" strokeWidth="0.5" />
            <line x1="20" y1="50" x2="80" y2="50" stroke="#CBD5E1" strokeWidth="0.5" />
            <line x1="28" y1="28" x2="72" y2="72" stroke="#CBD5E1" strokeWidth="0.5" />
            <line x1="72" y1="28" x2="28" y2="72" stroke="#CBD5E1" strokeWidth="0.5" />
          </g>
        );
    }
  };

  const getPinColor = (pin: MapFeaturePin, isTarget: boolean) => {
    if (mode === 'quiz' && isTarget && !revealed) {
      return 'bg-amber-500 text-white border-white shadow-md scale-110';
    }
    if (mode === 'quiz' && isTarget && revealed) {
      return 'bg-emerald-600 text-white border-white shadow-md';
    }
    if (activePinId === pin.id) {
      return 'bg-teal-700 text-white border-white shadow-md scale-110';
    }
    switch (pin.category) {
      case 'جبال':
        return 'bg-amber-700 text-white border-white';
      case 'هضاب':
        return 'bg-orange-600 text-white border-white';
      case 'أنهار وسهول':
        return 'bg-sky-600 text-white border-white';
      default:
        return 'bg-teal-600 text-white border-white';
    }
  };

  return (
    <div className="relative w-full">
      <div
        className={`relative mx-auto overflow-hidden rounded-xl border border-slate-200 bg-sky-50 ${
          compact ? 'max-h-[220px]' : zoomed ? 'max-h-[480px] overflow-auto' : 'max-h-[380px]'
        }`}
      >
        <div className={`relative mx-auto ${zoomed ? 'w-[140%]' : 'w-full'} aspect-[4/3] max-h-[380px]`}>
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            className="h-full w-full select-none"
          >
            {/* Ocean background graticule */}
            <rect width="100" height="100" fill="#E0F2FE" />
            <g stroke="#BAE6FD" strokeWidth="0.35">
              <line x1="0" y1="25" x2="100" y2="25" />
              <line x1="0" y1="50" x2="100" y2="50" />
              <line x1="0" y1="75" x2="100" y2="75" />
              <line x1="25" y1="0" x2="25" y2="100" />
              <line x1="50" y1="0" x2="50" y2="100" />
              <line x1="75" y1="0" x2="75" y2="100" />
            </g>
            {renderSilhouette()}
          </svg>

          {/* Interactive Pins Overlay */}
          {pins.map((pin) => {
            const isTarget = activePinId === pin.id;
            const showQuestionMark = mode === 'quiz' && isTarget && !revealed;

            if (mode === 'quiz' && !isTarget) {
              return (
                <div
                  key={pin.id}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 h-2.5 w-2.5 rounded-full bg-slate-400/50 border border-white"
                />
              );
            }

            return (
              <button
                key={pin.id}
                type="button"
                onClick={() => onSelectPin?.(pin)}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 rounded-lg border-2 px-2 py-1 text-xs font-bold transition-transform duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 ${getPinColor(
                  pin,
                  isTarget
                )} ${mode === 'atlas' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
              >
                {showQuestionMark ? (
                  <span className="px-1 text-sm font-black">؟</span>
                ) : (
                  <span className="whitespace-nowrap">{pin.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!compact && (
        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            {mode === 'atlas'
              ? 'اضغط على أي معلم جغرافي على الخريطة لعرض تفاصيله.'
              : revealed
              ? 'تم كشف المعلم الصحيح على الخريطة.'
              : 'حدد اسم المعلم الجغرافي المشار إليه بعلامة (؟).'}
          </span>
          <button
            type="button"
            onClick={() => setZoomed((z) => !z)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors whitespace-nowrap shrink-0"
          >
            {zoomed ? <ZoomOut className="h-3.5 w-3.5" /> : <ZoomIn className="h-3.5 w-3.5" />}
            <span>{zoomed ? 'تصغير الخريطة' : 'تكبير الخريطة'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
