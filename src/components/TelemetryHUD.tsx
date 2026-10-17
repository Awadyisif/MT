import React, { useState } from 'react';
import { ProofMetrics, GeometryType } from '../types';
import { Activity, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';

interface TelemetryHUDProps {
  metrics: ProofMetrics;
  geometryType: GeometryType;
  textureName: string;
  hasTexture: boolean;
  autoRotate: boolean;
  lang: 'ar' | 'en';
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  metrics,
  geometryType,
  textureName,
  hasTexture,
  lang,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const isAr = lang === 'ar';

  const geomLabels: Record<GeometryType, { ar: string; en: string }> = {
    sphere: { ar: 'قالب كروي (Sphere)', en: 'Sphere Adaptive' },
    box: { ar: 'قالب صندوقي (Box)', en: 'Experimental Box' },
    torus: { ar: 'طارة طوبولوجية (Torus)', en: 'Topological Torus' },
    torusKnot: { ar: 'عقدة كسيرية (Knot)', en: 'Fractal Knot' },
    icosahedron: { ar: 'عشروني السطوح (Icosa)', en: 'Quantum Icosa' },
    cylinder: { ar: 'أسطوانة زمكانية (Cylinder)', en: 'Spacetime Cylinder' },
  };

  return (
    <>
      {/* Top Left Panel: Telemetry & State */}
      <div className="absolute top-3 left-3 z-20 pointer-events-auto">
        <div className="bg-[#05050c]/85 backdrop-blur-md border border-white/5 border-l-2 border-l-[#9d4edd] rounded-lg p-2.5 sm:p-3 text-xs font-mono-code shadow-xl min-w-[210px] sm:min-w-[260px] transition-all">
          <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-1.5 mb-1.5 text-slate-300">
            <div className="flex items-center gap-1.5 font-bold text-[11px] text-[#9d4edd]">
              <Activity className="w-3.5 h-3.5" />
              <span>{isAr ? 'مصفوفة القياس عن بعد' : 'TELEMETRY MATRIX'}</span>
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-500 hover:text-slate-300 p-0.5"
              title={collapsed ? 'توسيع' : 'طي'}
            >
              {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          </div>

          {!collapsed && (
            <div className="space-y-1 text-[11px] leading-relaxed" dir="ltr">
              <div className="flex justify-between text-slate-400">
                <span>MATRIX STATE:</span>
                <span className="text-[#00f2fe] font-semibold">Unified Proof</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>GEOMETRY:</span>
                <span className="text-purple-300 font-semibold">{geomLabels[geometryType].en}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>INJECTED BLOCK:</span>
                <span
                  className={`font-semibold max-w-[130px] truncate ${
                    hasTexture ? 'text-[#00f2fe]' : 'text-slate-500'
                  }`}
                  title={hasTexture ? textureName : 'Waiting for injection'}
                >
                  {hasTexture ? textureName : (isAr ? 'انتظار الحقن' : 'Idle / Pending')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>QUANTUM FLUX:</span>
                <span className="text-amber-400 font-semibold">{metrics.quantumFlux.toFixed(1)} meV</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Right Panel: Proof Analytics */}
      <div className="absolute top-3 right-3 z-20 pointer-events-auto">
        <div className="bg-[#05050c]/85 backdrop-blur-md border border-white/5 border-r-2 border-r-[#ff007f] rounded-lg p-2.5 sm:p-3 text-xs shadow-xl min-w-[220px] sm:min-w-[270px]">
          <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 mb-1.5 text-[#00f2fe] font-bold text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#ff007f]" />
            <span>{isAr ? 'مؤشرات إثبات تداخل الوعي الهندسي' : 'Geometric Proof Indicators'}</span>
          </div>

          <div className="space-y-1 text-[11px] font-mono-code" dir="ltr">
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-slate-300">Interference (I):</span>
              <span
                className="font-bold tracking-wider"
                style={{
                  color: metrics.interference > 40 ? '#4df0a6' : '#94a3b8',
                }}
              >
                {metrics.interference.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-slate-300">Pressure Resonance:</span>
              <span className="text-[#ff007f] font-bold">{metrics.resonance.toFixed(3)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-slate-300">Entropy Delta (ΔS):</span>
              <span className="text-amber-400 font-bold">{metrics.entropy.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center text-slate-400">
              <span className="text-slate-300">Curvature Tensor:</span>
              <span className="text-cyan-400 font-bold">{metrics.topologicalCurvature.toFixed(3)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Left Panel: FPS & Coherence */}
      <div className="absolute bottom-4 left-3 z-20 pointer-events-none">
        <div className="bg-[#05050c]/80 backdrop-blur-md border border-white/5 border-l-2 border-l-[#4df0a6] rounded-lg px-3 py-2 text-xs font-mono-code shadow-xl leading-relaxed" dir="ltr">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">FPS:</span>
            <span
              className={`font-bold ${
                metrics.fps >= 50 ? 'text-[#00f2fe]' : metrics.fps >= 30 ? 'text-amber-400' : 'text-rose-400'
              }`}
            >
              {metrics.fps.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">MATRIX COHERENCE:</span>
            <span className="text-[#4df0a6] font-bold">{metrics.coherence.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </>
  );
};
