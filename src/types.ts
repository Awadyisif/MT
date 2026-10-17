export type GeometryType = 'sphere' | 'box' | 'torus' | 'torusKnot' | 'icosahedron' | 'cylinder';

export type RenderMode = 'wireframe' | 'solid' | 'points' | 'glow';

export type ColorTheme = 'neon-cyber' | 'quantum-emerald' | 'cosmic-void' | 'solar-plasma' | 'dark-monolith';

export interface ProofMetrics {
  interference: number;
  resonance: number;
  entropy: number;
  fps: number;
  coherence: number;
  topologicalCurvature: number;
  quantumFlux: number;
}

export interface SimulationParams {
  chunk: number;
  deform: number;
  freq: number;
  speed: number;
  targetDeform: number;
  targetFreq: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  geometryType: GeometryType;
  renderMode: RenderMode;
  hasTexture: boolean;
  textureName: string;
  autoRotate: boolean;
  colorTheme: ColorTheme;
  ambientAudio: boolean;
  audioVolume: number;
}

export type LedgerTag = 'tag-commit' | 'tag-proof' | 'tag-order' | 'tag-system' | 'tag-audio';

export interface LedgerEntry {
  id: string;
  chunk: number;
  timestamp: string;
  text: string;
  tag: LedgerTag;
}

export interface PresetTexture {
  id: string;
  name: string;
  arabicName: string;
  description: string;
  type: 'sacred' | 'neural' | 'cosmic' | 'cyber' | 'chromatic';
}
