import React from 'react';
import {
  Camera,
  Video,
  Volume2,
  VolumeX,
  RotateCcw,
  Eye,
  EyeOff,
  Languages,
} from 'lucide-react';

interface HeaderProps {
  chunkCount: number;
  isRecording: boolean;
  recordingTime: number;
  onToggleRecording: () => void;
  onCaptureSnapshot: () => void;
  onResetCamera: () => void;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  zenMode: boolean;
  onToggleZenMode: () => void;
  lang: 'ar' | 'en';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  chunkCount,
  isRecording,
  recordingTime,
  onToggleRecording,
  onCaptureSnapshot,
  onResetCamera,
  audioEnabled,
  onToggleAudio,
  zenMode,
  onToggleZenMode,
  lang,
  onToggleLang,
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const isAr = lang === 'ar';

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-[#090912]/95 backdrop-blur-md border-b border-[#16162a] text-slate-200 z-30 select-none">
      {/* Title & Description */}
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-8 bg-gradient-to-b from-[#00f2fe] via-[#9d4edd] to-[#ff007f] rounded-full shrink-0" />
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm md:text-base font-extrabold tracking-wide bg-gradient-to-r from-[#00f2fe] via-[#c084fc] to-[#ff007f] bg-clip-text text-transparent">
              {isAr
                ? 'مصفوفة الإثبات الطوبولوجي للأنسجة'
                : '3D Predictive World Simulator - The Proof Framework'}
            </h1>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 font-mono-code font-bold">
              v32.0 PROOF
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {isAr
              ? 'تداخل أنسجة الوعي مع مصفوفة المادة المظلمة الهندسية تحت الضغط الطيفي'
              : 'Consciousness tissue interference with geometric dark matter matrix under spectral pressure'}
          </p>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Node Convergence Counter */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#05050d] border border-[#1e1e38] font-mono-code text-xs">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">
            {isAr ? 'عقدة التقارب' : 'Node'}:
          </span>
          <span className="text-[#00f2fe] font-black text-sm tracking-widest">{chunkCount}</span>
        </div>

        {/* Video recording action */}
        <button
          onClick={onToggleRecording}
          title={isRecording ? 'إيقاف وحفظ الفيديو' : 'تسجيل وتصدير إثبات فيديو'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-md ${
            isRecording
              ? 'bg-rose-600 text-white border border-rose-400 ring-2 ring-rose-500/40'
              : 'bg-gradient-to-r from-[#6d28d9] to-[#ff007f] text-white hover:brightness-110 border border-purple-400/30'
          }`}
        >
          <Video className="w-3.5 h-3.5 shrink-0" />
          <span className="hidden md:inline">
            {isRecording
              ? `${isAr ? 'جاري التوثيق' : 'Recording'} (${formatTime(recordingTime)})`
              : isAr
              ? 'تصدير إثبات مصفوفة الحقيقة ©'
              : 'Export Video Proof ©'}
          </span>
          <span className="md:hidden">
            {isRecording ? formatTime(recordingTime) : isAr ? 'تسجيل' : 'Rec'}
          </span>
        </button>

        {/* Snapshot action */}
        <button
          onClick={onCaptureSnapshot}
          title={isAr ? 'التقاط لقطة شاشة مرجعية عالية الدقة' : 'Capture high-res proof snapshot'}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs bg-[#0f172a] hover:bg-[#1e293b] text-cyan-300 border border-cyan-500/30 transition-colors"
        >
          <Camera className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{isAr ? 'لقطة إثبات' : 'Snapshot'}</span>
        </button>

        {/* Ambient Cosmic Soundscape */}
        <button
          onClick={onToggleAudio}
          title={audioEnabled ? 'كتم صوت الرنين الكوني' : 'تشغيل رنين التردد الكوني'}
          className={`p-1.5 rounded-lg text-xs border transition-colors ${
            audioEnabled
              ? 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
              : 'bg-[#0f172a] border-[#1e293b] text-slate-400 hover:text-slate-200'
          }`}
        >
          {audioEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Reset Camera View */}
        <button
          onClick={onResetCamera}
          title={isAr ? 'إعادة ضبط زاوية الكاميرا' : 'Reset Camera Angle'}
          className="p-1.5 rounded-lg text-xs bg-[#0f172a] hover:bg-[#1e293b] text-slate-300 border border-[#1e293b] transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          title={isAr ? 'Switch to English' : 'التحويل إلى العربية'}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs bg-[#0f172a] hover:bg-[#1e293b] text-amber-300 border border-amber-500/30 transition-colors font-mono-code font-bold"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>{isAr ? 'EN' : 'AR'}</span>
        </button>

        {/* Zen Mode Toggle (hide UI overlays) */}
        <button
          onClick={onToggleZenMode}
          title={zenMode ? 'إظهار لوحات التحكم' : 'وضع الشاشة السينمائية الخالصة (Zen Mode)'}
          className={`p-1.5 rounded-lg text-xs border transition-colors ${
            zenMode
              ? 'bg-purple-950/70 border-purple-500/60 text-purple-300'
              : 'bg-[#0f172a] border-[#1e293b] text-slate-300 hover:text-slate-100'
          }`}
        >
          {zenMode ? <Eye className="w-4 h-4 text-purple-400" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
