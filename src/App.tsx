import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Viewport3D, Viewport3DHandle } from './components/Viewport3D';
import { Header } from './components/Header';
import { TelemetryHUD } from './components/TelemetryHUD';
import { ControlDock } from './components/ControlDock';
import {
  SimulationParams,
  ProofMetrics,
  LedgerEntry,
  LedgerTag,
} from './types';
import { PRESET_TEXTURES, createProceduralTexture } from './utils/proceduralTextures';
import { cosmicSynth } from './utils/audioSynth';
import * as THREE from 'three';
import { Sliders, ChevronRight, ChevronLeft } from 'lucide-react';

const INITIAL_PARAMS: SimulationParams = {
  chunk: 0,
  deform: 1.0,
  freq: 2.0,
  speed: 1.0,
  targetDeform: 1.0,
  targetFreq: 2.0,
  scaleX: 1.0,
  scaleY: 1.0,
  scaleZ: 1.0,
  geometryType: 'sphere',
  renderMode: 'wireframe',
  hasTexture: true,
  textureName: 'نسيج الوعي العصبي البيولوجي',
  autoRotate: true,
  colorTheme: 'neon-cyber',
  ambientAudio: false,
  audioVolume: 0.25,
};

export default function App() {
  const [params, setParams] = useState<SimulationParams>(INITIAL_PARAMS);
  const [metrics, setMetrics] = useState<ProofMetrics>({
    interference: 65.4,
    resonance: 1.25,
    entropy: 0.0152,
    fps: 60.0,
    coherence: 98.2,
    topologicalCurvature: 1.12,
    quantumFlux: 42.8,
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>([
    {
      id: 'init-1',
      chunk: 0,
      timestamp: new Date().toLocaleTimeString('ar-EG'),
      text: '[System] تم تشغيل محرّك الإثبات البنيوي v32.0. تم تحميل نسيج الوعي العصبي كنموذج مرجعي.',
      tag: 'tag-system',
    },
  ]);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [zenMode, setZenMode] = useState(false);
  const [lang, setLang] = useState<'ar' | 'en'>('ar');

  const viewportRef = useRef<Viewport3DHandle>(null);

  const appendLedger = useCallback((text: string, tag: LedgerTag = 'tag-system') => {
    setLedger((prev) => [
      ...prev.slice(-120), // retain last 120 logs for performance
      {
        id: Math.random().toString(36).substring(2, 9),
        chunk: params.chunk,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        text: `[N-${params.chunk}] ${text}`,
        tag,
      },
    ]);
  }, [params.chunk]);

  const handleChunkCommit = useCallback((chunk: number, stability: string) => {
    setParams((prev) => ({ ...prev, chunk }));
    appendLedger(
      `استقرار العقدة الطوبولوجية المحقونة #${chunk}. التوازن البنيوي: ${stability}.`,
      'tag-commit'
    );
  }, [appendLedger]);

  const handleMetricsUpdate = useCallback((newMetrics: ProofMetrics) => {
    setMetrics(newMetrics);
  }, []);

  const handleRecordingStatusChange = useCallback((recording: boolean, time: number) => {
    setIsRecording(recording);
    setRecordingTime(time);
    if (!recording && time > 0) {
      appendLedger(
        `[سجل السند] تم تصدير ملف الإثبات البصري الطوبولوجي المقاس علمياً بنجاح (${time} ثانية).`,
        'tag-proof'
      );
    }
  }, [appendLedger]);

  const toggleRecording = () => {
    if (isRecording) {
      viewportRef.current?.stopVideoRecording();
    } else {
      const started = viewportRef.current?.startVideoRecording();
      if (started) {
        appendLedger(
          'بدء تسجيل وتوثيق برهان المصفوفة الحية عبر دفق الإطارات البصرية...',
          'tag-order'
        );
      }
    }
  };

  const handleCaptureSnapshot = () => {
    viewportRef.current?.captureSnapshot();
    appendLedger('تم التقاط لقطة شاشة مرجعية عالية الدقة للبرهان البنيوي.', 'tag-proof');
  };

  const handleResetCamera = () => {
    viewportRef.current?.resetCamera();
    appendLedger('إعادة توجيه محور المراقبة الكونية إلى المركز المرجعي (0, 0, 4.3).', 'tag-order');
  };

  const handleToggleAudio = () => {
    const nextState = !params.ambientAudio;
    setParams((p) => ({ ...p, ambientAudio: nextState }));
    if (nextState) {
      cosmicSynth.start(params.audioVolume);
      appendLedger('تفعيل رنين التردد الكوني (432Hz Harmonic Synthesizer).', 'tag-audio');
    } else {
      cosmicSynth.stop();
      appendLedger('كتم موجات الرنين الكوني المسموعة.', 'tag-audio');
    }
  };

  const handleTextureUploaded = (texture: THREE.Texture, name: string) => {
    setParams((p) => ({
      ...p,
      hasTexture: true,
      textureName: name,
    }));
    viewportRef.current?.injectTexture(texture, name);
    appendLedger(
      `[إثبات بنيوي] تم دمج اللوحة [${name}] كخلفية مرجعية مستقرة للوعي.`,
      'tag-proof'
    );
  };

  const handlePresetTextureSelected = (type: (typeof PRESET_TEXTURES)[0]['type'], name: string) => {
    const texture = createProceduralTexture(type);
    setParams((p) => ({
      ...p,
      hasTexture: true,
      textureName: name,
    }));
    viewportRef.current?.injectTexture(texture, name);
    appendLedger(
      `[إثبات بنيوي] حقن مصفوفة وعي اصطناعية: [${name}].`,
      'tag-proof'
    );
  };

  const handleClearTexture = () => {
    setParams((p) => ({
      ...p,
      hasTexture: false,
      textureName: 'مادة مظلمة خام',
    }));
    appendLedger('تم فصل النسيج البصري والعودة لحالة المادة المظلمة الخالصة.', 'tag-order');
  };

  const handleInjectPattern = (
    pattern: 'HYPER_FRACTAL' | 'FLUID_MATRIX' | 'QUANTUM_RESONANCE' | 'COSMIC_EQUILIBRIUM' | 'RESET'
  ) => {
    if (pattern === 'HYPER_FRACTAL') {
      setParams((p) => ({
        ...p,
        targetDeform: 4.5,
        targetFreq: 7.0,
      }));
      appendLedger('[أمر] حقن نبضة كسيرية حرجة لتوليد أقصى تداخل طيفي اضطرابي.', 'tag-order');
    } else if (pattern === 'FLUID_MATRIX') {
      setParams((p) => ({
        ...p,
        targetDeform: 1.8,
        targetFreq: 1.5,
      }));
      appendLedger('[أمر] تحفيز التدفق البيولوجي المرن لمحاكاة تموجات الوعي الإنساني.', 'tag-order');
    } else if (pattern === 'QUANTUM_RESONANCE') {
      setParams((p) => ({
        ...p,
        targetDeform: 2.8,
        targetFreq: 5.2,
      }));
      appendLedger('[أمر] توليد رنين كمومي عالي التوافق في الأبعاد المتشعبة.', 'tag-order');
    } else if (pattern === 'COSMIC_EQUILIBRIUM') {
      setParams((p) => ({
        ...p,
        targetDeform: 1.2,
        targetFreq: 3.14,
      }));
      appendLedger('[أمر] موازنة التردد مع ثابت النسبة الذهبية الكونية (π Equilibrium).', 'tag-order');
    } else {
      setParams((p) => ({
        ...p,
        targetDeform: 1.0,
        targetFreq: 2.0,
        scaleX: 1.0,
        scaleY: 1.0,
        scaleZ: 1.0,
      }));
      appendLedger('[نظام] إعادة ضبط مصفوفة الأبعاد للقوالب الأساسية المتزنة.', 'tag-system');
    }
  };

  const handleExportLedger = (format: 'txt' | 'json') => {
    if (format === 'json') {
      const jsonStr = JSON.stringify(ledger, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Empirical-Ledger-${Date.now()}.json`;
      a.click();
    } else {
      const text = ledger
        .map((entry) => `[${entry.timestamp}] [Node ${entry.chunk}] [${entry.tag}] ${entry.text}`)
        .join('\n');
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Empirical-Proof-Report-${Date.now()}.txt`;
      a.click();
    }
    appendLedger(`تم تصدير سجل البرهان الكامل بصيغة ${format.toUpperCase()}.`, 'tag-proof');
  };

  const handleClearLedger = () => {
    setLedger([
      {
        id: Math.random().toString(),
        chunk: params.chunk,
        timestamp: new Date().toLocaleTimeString('ar-EG'),
        text: 'تمت تصفية سجل البرهان والأشكال. بدء دورة قياس جديدة.',
        tag: 'tag-system',
      },
    ]);
  };

  // Keyboard shortcut: H for Zen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'h' || e.key === 'H') {
        setZenMode((z) => !z);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      dir={lang === 'ar' ? 'rtl' : 'ltr'}
      className="flex flex-col h-screen w-screen bg-[#040406] text-[#e2e8f0] select-none overflow-hidden font-sans"
    >
      {/* Header */}
      {!zenMode && (
        <Header
          chunkCount={params.chunk}
          isRecording={isRecording}
          recordingTime={recordingTime}
          onToggleRecording={toggleRecording}
          onCaptureSnapshot={handleCaptureSnapshot}
          onResetCamera={handleResetCamera}
          audioEnabled={params.ambientAudio}
          onToggleAudio={handleToggleAudio}
          zenMode={zenMode}
          onToggleZenMode={() => setZenMode(true)}
          lang={lang}
          onToggleLang={() => setLang((l) => (l === 'ar' ? 'en' : 'ar'))}
        />
      )}

      {/* Main Viewport & Sidebar Wrapper */}
      <div className="relative flex flex-1 min-h-0 overflow-hidden">
        {/* Central 3D Viewport */}
        <main className="relative flex-1 h-full bg-black overflow-hidden">
          <Viewport3D
            ref={viewportRef}
            geometryType={params.geometryType}
            renderMode={params.renderMode}
            colorTheme={params.colorTheme}
            deform={params.targetDeform}
            freq={params.targetFreq}
            speed={params.speed}
            scaleX={params.scaleX}
            scaleY={params.scaleY}
            scaleZ={params.scaleZ}
            autoRotate={params.autoRotate}
            hasTexture={params.hasTexture}
            onChunkCommit={handleChunkCommit}
            onMetricsUpdate={handleMetricsUpdate}
            onRecordingStatusChange={handleRecordingStatusChange}
          />

          {/* Floating Telemetry & Proof HUD */}
          {!zenMode && (
            <TelemetryHUD
              metrics={metrics}
              geometryType={params.geometryType}
              textureName={params.textureName}
              hasTexture={params.hasTexture}
              autoRotate={params.autoRotate}
              lang={lang}
            />
          )}

          {/* Floating Zen Mode exit pill */}
          {zenMode && (
            <div className={`absolute top-4 ${lang === 'ar' ? 'right-4' : 'left-4'} z-40`}>
              <button
                onClick={() => setZenMode(false)}
                className="px-3 py-1.5 rounded-full bg-[#090916]/80 backdrop-blur-md border border-cyan-500/50 text-cyan-300 text-xs font-bold shadow-2xl hover:bg-cyan-500/20 transition-all flex items-center gap-2"
              >
                <span>{lang === 'ar' ? 'خروج من وضع المشاهدة (H)' : 'Exit Zen Mode (H)'}</span>
              </button>
            </div>
          )}

          {/* Sidebar Toggle Handle */}
          {!zenMode && (
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? (lang === 'ar' ? 'إخفاء لوحة التحكم' : 'Hide Controls') : (lang === 'ar' ? 'إظهار لوحة التحكم' : 'Show Controls')}
              className={`absolute top-1/2 -translate-y-1/2 ${
                lang === 'ar' ? 'left-0 rounded-r-md border-l-0' : 'right-0 rounded-l-md border-r-0'
              } z-30 bg-[#090914] border border-[#252540] text-cyan-400 hover:text-cyan-200 p-1.5 shadow-xl transition-all`}
            >
              {sidebarOpen ? (
                lang === 'ar' ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                lang === 'ar' ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
              )}
            </button>
          )}
        </main>

        {/* Control Sidebar */}
        {!zenMode && sidebarOpen && (
          <ControlDock
            params={params}
            ledger={ledger}
            isRecording={isRecording}
            lang={lang}
            onUpdateParams={setParams}
            onTextureUploaded={handleTextureUploaded}
            onPresetTextureSelected={handlePresetTextureSelected}
            onClearTexture={handleClearTexture}
            onInjectPattern={handleInjectPattern}
            onToggleRecording={toggleRecording}
            onExportLedger={handleExportLedger}
            onClearLedger={handleClearLedger}
          />
        )}
      </div>
    </div>
  );
}
