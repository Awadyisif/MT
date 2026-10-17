import React, { useRef, useState } from 'react';
import {
  GeometryType,
  RenderMode,
  ColorTheme,
  SimulationParams,
  LedgerEntry,
} from '../types';
import { PRESET_TEXTURES } from '../utils/proceduralTextures';
import * as THREE from 'three';
import {
  Upload,
  Download,
  Trash2,
  ChevronUp,
  ChevronDown,
  Sparkles,
  Orbit,
  Video,
} from 'lucide-react';

interface ControlDockProps {
  params: SimulationParams;
  ledger: LedgerEntry[];
  isRecording: boolean;
  lang: 'ar' | 'en';
  onUpdateParams: (updater: (prev: SimulationParams) => SimulationParams) => void;
  onTextureUploaded: (texture: THREE.Texture, name: string) => void;
  onPresetTextureSelected: (type: (typeof PRESET_TEXTURES)[0]['type'], name: string) => void;
  onClearTexture: () => void;
  onInjectPattern: (pattern: 'HYPER_FRACTAL' | 'FLUID_MATRIX' | 'QUANTUM_RESONANCE' | 'COSMIC_EQUILIBRIUM' | 'RESET') => void;
  onToggleRecording: () => void;
  onExportLedger: (format: 'txt' | 'json') => void;
  onClearLedger: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  params,
  ledger,
  isRecording,
  lang,
  onUpdateParams,
  onTextureUploaded,
  onPresetTextureSelected,
  onClearTexture,
  onInjectPattern,
  onToggleRecording,
  onExportLedger,
  onClearLedger,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'textures' | 'geometry' | 'pressure' | 'ledger'>('all');
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'tag-proof' | 'tag-order' | 'tag-commit'>('all');
  const sidebarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isAr = lang === 'ar';

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const texture = new THREE.Texture(img);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        onTextureUploaded(texture, file.name);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const scrollSidebar = (direction: 'up' | 'down') => {
    if (sidebarRef.current) {
      const step = 200;
      sidebarRef.current.scrollBy({
        top: direction === 'down' ? step : -step,
        behavior: 'smooth',
      });
    }
  };

  const filteredLedger = ledger.filter((entry) => {
    if (ledgerFilter === 'all') return true;
    return entry.tag === ledgerFilter;
  });

  return (
    <div className="relative flex flex-col h-full bg-[#070710]/95 backdrop-blur-xl border-x border-[#141426] text-slate-200 w-full md:w-[370px] lg:w-[410px] shrink-0 overflow-hidden shadow-2xl">
      {/* Scroll Navigation Floating Buttons */}
      <div className={`absolute ${isAr ? 'left-3' : 'right-3'} bottom-4 flex flex-col gap-1.5 z-30`}>
        <button
          onClick={() => scrollSidebar('up')}
          className="w-7 h-7 rounded-full bg-[#0a0a16]/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center text-xs transition-colors shadow-md"
          title={isAr ? 'التمرير لأعلى' : 'Scroll Up'}
        >
          <ChevronUp className="w-4 h-4" />
        </button>
        <button
          onClick={() => scrollSidebar('down')}
          className="w-7 h-7 rounded-full bg-[#0a0a16]/90 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/20 flex items-center justify-center text-xs transition-colors shadow-md"
          title={isAr ? 'التمرير لأسفل' : 'Scroll Down'}
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* Control Tabs Header */}
      <div className="flex items-center gap-1 p-2 bg-[#05050b] border-b border-[#131325] overflow-x-auto text-[11px] font-bold shrink-0">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-2.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'all' ? 'bg-[#181832] text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? 'الكل' : 'All'}
        </button>
        <button
          onClick={() => setActiveTab('textures')}
          className={`px-2.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'textures' ? 'bg-[#181832] text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? 'حقن الأنسجة' : 'Textures'}
        </button>
        <button
          onClick={() => setActiveTab('geometry')}
          className={`px-2.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'geometry' ? 'bg-[#181832] text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? 'القوالب والأبعاد' : 'Geometry'}
        </button>
        <button
          onClick={() => setActiveTab('pressure')}
          className={`px-2.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'pressure' ? 'bg-[#181832] text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? 'الضغط والكسيريات' : 'Pressure'}
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-2.5 py-1.5 rounded-md transition-colors ${
            activeTab === 'ledger' ? 'bg-[#181832] text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {isAr ? 'سجل البرهان' : 'Ledger'} ({ledger.length})
        </button>
      </div>

      {/* Main Scrollable Content */}
      <div ref={sidebarRef} className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {/* Section 1: Texture Injection */}
        {(activeTab === 'all' || activeTab === 'textures') && (
          <div className="bg-[#0b0b16]/70 rounded-lg p-3 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 border-r-2 border-r-[#9d4edd] pr-2">
              <span>{isAr ? 'حقن النسيج البصري (شاهد الوعي المنظم)' : 'Visual Texture Injection (Consciousness)'}</span>
              {params.hasTexture && (
                <button
                  onClick={onClearTexture}
                  className="text-[10px] text-rose-400 hover:text-rose-300 underline font-normal"
                >
                  {isAr ? 'إلغاء الحقن' : 'Eject'}
                </button>
              )}
            </div>

            {/* Custom file uploader */}
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                {isAr
                  ? 'اختر لوحة فنية أو صورة مجهرية لقياس التداخل:'
                  : 'Upload artwork/microscopic image to measure interference:'}
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 py-2 px-3 rounded border border-dashed border-slate-700 hover:border-cyan-400/60 bg-[#06060c] cursor-pointer text-xs text-slate-300 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-cyan-400" />
                <span className="truncate">
                  {params.hasTexture ? params.textureName : (isAr ? 'انقر لرفع ملف صورة (JPG, PNG, WebP)' : 'Click to upload image file')}
                </span>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Instant Preset Textures */}
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                {isAr ? 'أو اختر نسيج وعي تركيبي جاهز:' : 'Or select synthetic preset texture:'}
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {PRESET_TEXTURES.map((pt) => {
                  const isSelected = params.hasTexture && (params.textureName === pt.arabicName || params.textureName === pt.name);
                  return (
                    <button
                      key={pt.id}
                      onClick={() => onPresetTextureSelected(pt.type, isAr ? pt.arabicName : pt.name)}
                      className={`flex items-start justify-between p-2 rounded text-right transition-all text-xs border ${
                        isSelected
                          ? 'bg-purple-950/40 border-purple-500/70 text-cyan-200 ring-1 ring-purple-500/30'
                          : 'bg-[#090913] border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="font-bold flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                          <span>{isAr ? pt.arabicName : pt.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{pt.description}</div>
                      </div>
                      <span className="text-[9px] font-mono-code text-slate-500 px-1 py-0.5 rounded bg-black/40">
                        {pt.type}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Geometry & Adaptation */}
        {(activeTab === 'all' || activeTab === 'geometry') && (
          <div className="bg-[#0b0b16]/70 rounded-lg p-3 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-cyan-300 border-r-2 border-r-[#9d4edd] pr-2">
              {isAr ? 'تعديل أبعاد لوحة العرض (Canvas Adaptation)' : 'Canvas Geometry & Dimensions'}
            </div>

            {/* Geometry Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, geometryType: 'sphere', scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.geometryType === 'sphere'
                    ? 'border-purple-500 bg-purple-950/50 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'قالب كروي (متزن)' : 'Sphere (Balanced)'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, geometryType: 'box', scaleX: 1.5, scaleY: 1.0, scaleZ: 1.0 }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.geometryType === 'box'
                    ? 'border-purple-500 bg-purple-950/50 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'قالب صندوقي (تجريبي)' : 'Box (Experimental)'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, geometryType: 'torus', scaleX: 1.1, scaleY: 1.1, scaleZ: 1.1 }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.geometryType === 'torus'
                    ? 'border-purple-500 bg-purple-950/50 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'طارة طوبولوجية' : 'Torus Topology'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, geometryType: 'torusKnot', scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.geometryType === 'torusKnot'
                    ? 'border-purple-500 bg-purple-950/50 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'عقدة كسيرية' : 'Torus Knot'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, geometryType: 'icosahedron', scaleX: 1.0, scaleY: 1.0, scaleZ: 1.0 }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.geometryType === 'icosahedron'
                    ? 'border-purple-500 bg-purple-950/50 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'عشروني السطوح' : 'Icosahedron'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, geometryType: 'cylinder', scaleX: 1.0, scaleY: 1.3, scaleZ: 1.0 }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.geometryType === 'cylinder'
                    ? 'border-purple-500 bg-purple-950/50 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'أسطوانة زمكانية' : 'Spacetime Cylinder'}
              </button>
            </div>

            {/* Dimensional Scaling Sliders */}
            <div className="space-y-2 pt-1 border-t border-white/5">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{isAr ? 'التمدد الأفقي (X-Scale)' : 'Horizontal X-Scale'}</span>
                  <span className="font-mono-code text-cyan-300">{params.scaleX.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={params.scaleX}
                  onChange={(e) => onUpdateParams((p) => ({ ...p, scaleX: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00f2fe] h-1.5 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{isAr ? 'التمدد الرأسي (Y-Scale)' : 'Vertical Y-Scale'}</span>
                  <span className="font-mono-code text-cyan-300">{params.scaleY.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={params.scaleY}
                  onChange={(e) => onUpdateParams((p) => ({ ...p, scaleY: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00f2fe] h-1.5 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{isAr ? 'العمق البعدي (Z-Scale)' : 'Depth Z-Scale'}</span>
                  <span className="font-mono-code text-cyan-300">{params.scaleZ.toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="2.5"
                  step="0.1"
                  value={params.scaleZ}
                  onChange={(e) => onUpdateParams((p) => ({ ...p, scaleZ: parseFloat(e.target.value) }))}
                  className="w-full accent-[#00f2fe] h-1.5 bg-slate-900 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: Topology Render & Spectral Themes */}
        {(activeTab === 'all' || activeTab === 'geometry') && (
          <div className="bg-[#0b0b16]/70 rounded-lg p-3 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-cyan-300 border-r-2 border-r-[#9d4edd] pr-2">
              {isAr ? 'حالة الشيدر الطوبولوجية (Topology Render)' : 'Topology Shader Render Mode'}
            </div>

            {/* Render Modes */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, renderMode: 'wireframe' }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.renderMode === 'wireframe'
                    ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'هيكل شبكي (المادة الخام)' : 'Wireframe (Raw)'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, renderMode: 'solid' }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.renderMode === 'solid'
                    ? 'border-purple-400 bg-purple-950/40 text-purple-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'تجسيد مصمت (التحام)' : 'Solid (Fused)'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, renderMode: 'points' }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.renderMode === 'points'
                    ? 'border-emerald-400 bg-emerald-950/40 text-emerald-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'سحابة نقاط كمومية' : 'Quantum Points'}
              </button>
              <button
                onClick={() => onUpdateParams((p) => ({ ...p, renderMode: 'glow' }))}
                className={`py-1.5 px-2 rounded text-xs border transition-all ${
                  params.renderMode === 'glow'
                    ? 'border-rose-400 bg-rose-950/40 text-rose-200'
                    : 'border-slate-800 bg-[#080812] text-slate-400 hover:text-slate-200'
                }`}
              >
                {isAr ? 'توهج هولوغرافي' : 'Hologram Glow'}
              </button>
            </div>

            {/* Color Palette Themes */}
            <div className="pt-2 border-t border-white/5">
              <label className="block text-[11px] text-slate-400 mb-1.5">
                {isAr ? 'تدرجات ألوان الوعي النيونية (Spectral Palettes):' : 'Spectral Neon Palettes:'}
              </label>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'neon-cyber', ar: 'نيون سيبراني', en: 'Neon Cyber' },
                  { id: 'quantum-emerald', ar: 'زمردي كمومي', en: 'Quantum Emerald' },
                  { id: 'cosmic-void', ar: 'فراغ كوني', en: 'Cosmic Void' },
                  { id: 'solar-plasma', ar: 'بلازما شمسية', en: 'Solar Plasma' },
                ].map((th) => (
                  <button
                    key={th.id}
                    onClick={() => onUpdateParams((p) => ({ ...p, colorTheme: th.id as ColorTheme }))}
                    className={`py-1 px-2 rounded text-[11px] text-right border truncate transition-all ${
                      params.colorTheme === th.id
                        ? 'border-cyan-400 bg-cyan-950/50 text-cyan-200'
                        : 'border-slate-800 bg-[#06060e] text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {isAr ? `${th.ar} (${th.en})` : th.en}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Section 4: Pressure & Fractal Distortion Settings */}
        {(activeTab === 'all' || activeTab === 'pressure') && (
          <div className="bg-[#0b0b16]/70 rounded-lg p-3 border border-white/5 space-y-3">
            <div className="text-xs font-bold text-cyan-300 border-r-2 border-r-[#9d4edd] pr-2">
              {isAr ? 'معاملات الضغط والتشويه الكسيري (Pressure Settings)' : 'Spectral Pressure & Fractal Distortion'}
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{isAr ? 'شدة ضغط التشويه الكسيري' : 'Deformation Intensity'}</span>
                  <span className="font-mono-code text-[#ff007f] font-bold">
                    {params.targetDeform.toFixed(1)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  value={params.targetDeform}
                  onChange={(e) =>
                    onUpdateParams((p) => ({ ...p, targetDeform: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-[#ff007f] h-1.5 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{isAr ? 'التردد الاهتزازي للمصفوفة' : 'Vibrational Frequency'}</span>
                  <span className="font-mono-code text-cyan-300 font-bold">
                    {params.targetFreq.toFixed(1)} Hz
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="8"
                  step="0.1"
                  value={params.targetFreq}
                  onChange={(e) =>
                    onUpdateParams((p) => ({ ...p, targetFreq: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-cyan-400 h-1.5 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>{isAr ? 'سرعة التنبؤ الزمني (Flow Speed)' : 'Time Prediction Flow Speed'}</span>
                  <span className="font-mono-code text-purple-300 font-bold">
                    {params.speed.toFixed(1)}x
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="3"
                  step="0.1"
                  value={params.speed}
                  onChange={(e) =>
                    onUpdateParams((p) => ({ ...p, speed: parseFloat(e.target.value) }))
                  }
                  className="w-full accent-purple-400 h-1.5 bg-slate-900 rounded cursor-pointer"
                />
              </div>

              {/* Auto rotate toggle */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Orbit className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{isAr ? 'دوران المدار التلقائي' : 'Auto Orbit Rotation'}</span>
                </span>
                <button
                  onClick={() => onUpdateParams((p) => ({ ...p, autoRotate: !p.autoRotate }))}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors ${
                    params.autoRotate
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}
                >
                  {params.autoRotate ? (isAr ? 'مفعّل' : 'Active') : (isAr ? 'متوقف' : 'Paused')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section 5: Instant Calibration Actions */}
        {(activeTab === 'all' || activeTab === 'pressure') && (
          <div className="bg-[#0b0b16]/70 rounded-lg p-3 border border-white/5 space-y-2.5">
            <div className="text-xs font-bold text-cyan-300 border-r-2 border-r-[#9d4edd] pr-2">
              {isAr ? 'أوامر المعايرة والحقن الفوري (Instant Calibration)' : 'Instant Calibration & Patterns'}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => onInjectPattern('HYPER_FRACTAL')}
                className="py-1.5 px-2 rounded text-xs bg-[#090914] border border-rose-500/30 hover:border-rose-400 text-rose-300 hover:bg-rose-950/20 transition-all font-semibold"
              >
                {isAr ? 'مصفوفة كسيرية حرجة' : 'Hyper Fractal'}
              </button>
              <button
                onClick={() => onInjectPattern('FLUID_MATRIX')}
                className="py-1.5 px-2 rounded text-xs bg-[#090914] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-950/20 transition-all font-semibold"
              >
                {isAr ? 'تدفق بيولوجي مرن' : 'Fluid Matrix'}
              </button>
              <button
                onClick={() => onInjectPattern('QUANTUM_RESONANCE')}
                className="py-1.5 px-2 rounded text-xs bg-[#090914] border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:bg-purple-950/20 transition-all font-semibold"
              >
                {isAr ? 'رنين كمومي فائق' : 'Quantum Res'}
              </button>
              <button
                onClick={() => onInjectPattern('COSMIC_EQUILIBRIUM')}
                className="py-1.5 px-2 rounded text-xs bg-[#090914] border border-emerald-500/30 hover:border-emerald-400 text-emerald-300 hover:bg-emerald-950/20 transition-all font-semibold"
              >
                {isAr ? 'توازن كوني مستقر' : 'Cosmic Equilibrium'}
              </button>
              <button
                onClick={() => onInjectPattern('RESET')}
                className="py-1.5 px-2 rounded text-xs bg-[#090914] border border-slate-700 hover:border-slate-500 text-slate-300 transition-all font-semibold col-span-2"
              >
                {isAr ? 'إعادة ضبط النواة الهندسية' : 'Reset Core Geometry'}
              </button>

              {/* Video recording proof button */}
              <button
                onClick={onToggleRecording}
                className={`col-span-2 py-2 px-3 rounded text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2 ${
                  isRecording
                    ? 'bg-rose-600 text-white border border-rose-400 animate-pulse'
                    : 'bg-gradient-to-r from-[#6d28d9] to-[#ff007f] text-white hover:brightness-110'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>
                  {isRecording
                    ? (isAr ? 'إيقاف وحفظ التوثيق' : 'Stop & Save Recording')
                    : (isAr ? 'تصدير إثبات مصفوفة الحقيقة ©' : 'Export Video Proof ©')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Section 6: Empirical Ledger */}
        {(activeTab === 'all' || activeTab === 'ledger') && (
          <div className="bg-[#0b0b16]/70 rounded-lg p-3 border border-white/5 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-cyan-300 border-r-2 border-r-[#9d4edd] pr-2">
              <span>{isAr ? 'سجل البرهان والأشكال (Empirical Ledger)' : 'Empirical Proof Ledger'}</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onExportLedger('txt')}
                  title={isAr ? 'تصدير السجل كتقرير نصي' : 'Export log report'}
                  className="p-1 rounded bg-[#090914] text-slate-400 hover:text-cyan-300 border border-slate-800"
                >
                  <Download className="w-3 h-3" />
                </button>
                <button
                  onClick={onClearLedger}
                  title={isAr ? 'مسح السجل' : 'Clear log'}
                  className="p-1 rounded bg-[#090914] text-slate-400 hover:text-rose-400 border border-slate-800"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Filter buttons */}
            <div className="flex gap-1 text-[10px] font-mono-code">
              <button
                onClick={() => setLedgerFilter('all')}
                className={`px-2 py-0.5 rounded ${
                  ledgerFilter === 'all' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isAr ? 'الكل' : 'All'}
              </button>
              <button
                onClick={() => setLedgerFilter('tag-proof')}
                className={`px-2 py-0.5 rounded ${
                  ledgerFilter === 'tag-proof' ? 'bg-emerald-950 text-emerald-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isAr ? 'براهين' : 'Proofs'}
              </button>
              <button
                onClick={() => setLedgerFilter('tag-order')}
                className={`px-2 py-0.5 rounded ${
                  ledgerFilter === 'tag-order' ? 'bg-purple-950 text-purple-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isAr ? 'أوامر' : 'Orders'}
              </button>
              <button
                onClick={() => setLedgerFilter('tag-commit')}
                className={`px-2 py-0.5 rounded ${
                  ledgerFilter === 'tag-commit' ? 'bg-cyan-950 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {isAr ? 'عقد' : 'Nodes'}
              </button>
            </div>

            {/* Scrollable ledger box */}
            <div className="h-44 overflow-y-auto bg-[#020205] rounded border border-slate-900 p-2 text-[11px] font-mono-code space-y-1.5" dir="ltr">
              {filteredLedger.length === 0 ? (
                <div className="text-slate-600 text-center py-4">No matching records</div>
              ) : (
                filteredLedger.map((item) => {
                  let tagColor = 'text-slate-400';
                  if (item.tag === 'tag-proof') tagColor = 'text-emerald-400';
                  if (item.tag === 'tag-commit') tagColor = 'text-cyan-400';
                  if (item.tag === 'tag-order') tagColor = 'text-purple-400';
                  if (item.tag === 'tag-audio') tagColor = 'text-amber-400';

                  return (
                    <div
                      key={item.id}
                      className="border-b border-white/[0.03] pb-1 leading-snug break-words"
                    >
                      <span className="text-slate-500 text-[10px] mr-1.5">[{item.timestamp}]</span>
                      <span className={`font-semibold ${tagColor}`}>{item.text}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
