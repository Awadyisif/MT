import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GeometryType, RenderMode, ColorTheme, ProofMetrics } from '../types';
import { createProceduralTexture } from '../utils/proceduralTextures';
import { cosmicSynth } from '../utils/audioSynth';

export interface Viewport3DHandle {
  captureSnapshot: () => void;
  startVideoRecording: () => boolean;
  stopVideoRecording: () => void;
  injectTexture: (texture: THREE.Texture, name: string) => void;
  resetCamera: () => void;
}

interface Viewport3DProps {
  geometryType: GeometryType;
  renderMode: RenderMode;
  colorTheme: ColorTheme;
  deform: number;
  freq: number;
  speed: number;
  scaleX: number;
  scaleY: number;
  scaleZ: number;
  autoRotate: boolean;
  hasTexture: boolean;
  onChunkCommit: (chunk: number, stability: string) => void;
  onMetricsUpdate: (metrics: ProofMetrics) => void;
  onRecordingStatusChange: (isRecording: boolean, recordedTime: number) => void;
}

const THEME_COLORS: Record<ColorTheme, { a: THREE.Color; b: THREE.Color; accent: THREE.Color }> = {
  'neon-cyber': {
    a: new THREE.Color(0x00f2fe),
    b: new THREE.Color(0x9d4edd),
    accent: new THREE.Color(0xff007f),
  },
  'quantum-emerald': {
    a: new THREE.Color(0x4df0a6),
    b: new THREE.Color(0x0284c7),
    accent: new THREE.Color(0xfacc15),
  },
  'cosmic-void': {
    a: new THREE.Color(0xa855f7),
    b: new THREE.Color(0xec4899),
    accent: new THREE.Color(0x38bdf8),
  },
  'solar-plasma': {
    a: new THREE.Color(0xf97316),
    b: new THREE.Color(0xd946ef),
    accent: new THREE.Color(0xfde047),
  },
  'dark-monolith': {
    a: new THREE.Color(0x94a3b8),
    b: new THREE.Color(0x3b82f6),
    accent: new THREE.Color(0xe2e8f0),
  },
};

const vertexShaderSource = `
  uniform float uTime;
  uniform float uDeformIntensity;
  uniform float uFrequency;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec2 vUv;

  float calculateDisplacement(vec3 p) {
    float waveX = sin(p.x * uFrequency + uTime) * cos(p.y * uFrequency + uTime);
    float waveY = sin(p.y * uFrequency - uTime) * cos(p.z * uFrequency + uTime);
    float waveZ = sin(p.z * uFrequency + uTime) * cos(p.x * uFrequency - uTime);
    return (waveX + waveY + waveZ) * 0.15 * uDeformIntensity;
  }

  void main() {
    vNormal = normal;
    vPosition = position;
    vUv = uv;
    vDisplacement = calculateDisplacement(position);
    vec3 newPosition = position + normal * vDisplacement;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    gl_PointSize = clamp(3.0 + vDisplacement * 4.0, 1.5, 9.0);
  }
`;

const fragmentShaderSource = `
  uniform float uTime;
  uniform sampler2D uTexture;
  uniform bool uHasTexture;
  uniform float uDeformIntensity;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorAccent;
  uniform float uOpacity;
  uniform bool uIsPoints;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;
  varying vec2 vUv;

  void main() {
    vec3 baseColor = mix(uColorA, uColorB, sin(vDisplacement * 8.0) * 0.5 + 0.5);

    if (uHasTexture) {
      vec4 texColor = texture2D(uTexture, vUv);
      float interferenceFactor = 0.4 + (0.3 * sin(uTime + vDisplacement));
      baseColor = mix(texColor.rgb, baseColor, interferenceFactor);
    }

    vec3 lightDir = normalize(vec3(1.0, 1.2, 1.0));
    float lighting = dot(normalize(vNormal), lightDir) * 0.45 + 0.55;

    // Rim Fresnel glow
    vec3 viewDir = normalize(-vPosition);
    float fresnel = pow(1.0 - max(dot(normalize(vNormal), viewDir), 0.0), 3.0);
    baseColor += uColorAccent * fresnel * 0.4;

    if (uIsPoints) {
      // Circular point particle fade
      float r = length(gl_PointCoord - vec2(0.5));
      if (r > 0.5) discard;
      gl_FragColor = vec4(baseColor * 1.3, 1.0);
    } else {
      gl_FragColor = vec4(baseColor * lighting, uOpacity);
    }
  }
`;

export const Viewport3D = forwardRef<Viewport3DHandle, Viewport3DProps>(({
  geometryType,
  renderMode,
  colorTheme,
  deform,
  freq,
  speed,
  scaleX,
  scaleY,
  scaleZ,
  autoRotate,
  hasTexture,
  onChunkCommit,
  onMetricsUpdate,
  onRecordingStatusChange,
}, ref) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const meshRef = useRef<THREE.Object3D | null>(null);
  const shaderMaterialRef = useRef<THREE.ShaderMaterial | null>(null);

  // Background stars / particle field
  const backgroundFieldRef = useRef<THREE.Points | null>(null);

  // Simulation loop tracking
  const currentDeformRef = useRef(deform);
  const currentFreqRef = useRef(freq);
  const speedRef = useRef(speed);
  const autoRotateRef = useRef(autoRotate);
  const hasTextureRef = useRef(hasTexture);

  // Sync state refs to avoid tearing down webgl loop
  currentDeformRef.current = deform;
  currentFreqRef.current = freq;
  speedRef.current = speed;
  autoRotateRef.current = autoRotate;
  hasTextureRef.current = hasTexture;

  // Recording state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordStartTimeRef = useRef<number>(0);
  const recordTimerRef = useRef<number | null>(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current || !mountRef.current) return;

    const canvas = canvasRef.current;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      preserveDrawingBuffer: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    rendererRef.current = renderer;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040406);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.3);
    cameraRef.current = camera;

    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 1.0;
    controls.minDistance = 1.8;
    controls.maxDistance = 12.0;
    controlsRef.current = controls;

    // Ambient background quantum dust particles
    const starCount = 600;
    const starGeom = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 24;
      starPositions[i * 3 + 1] = (Math.random() - 0.5) * 24;
      starPositions[i * 3 + 2] = (Math.random() - 0.5) * 24;
      const col = Math.random() > 0.5 ? new THREE.Color(0x00f2fe) : new THREE.Color(0x9d4edd);
      starColors[i * 3] = col.r;
      starColors[i * 3 + 1] = col.g;
      starColors[i * 3 + 2] = col.b;
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeom.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      vertexColors: true,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);
    backgroundFieldRef.current = starField;

    // Default procedural test texture
    const initialTexture = createProceduralTexture('neural');

    // Shader Material
    const initialColors = THEME_COLORS[colorTheme];
    const shaderMaterial = new THREE.ShaderMaterial({
      vertexShader: vertexShaderSource,
      fragmentShader: fragmentShaderSource,
      uniforms: {
        uTime: { value: 0.0 },
        uDeformIntensity: { value: deform },
        uFrequency: { value: freq },
        uTexture: { value: initialTexture },
        uHasTexture: { value: true },
        uColorA: { value: initialColors.a },
        uColorB: { value: initialColors.b },
        uColorAccent: { value: initialColors.accent },
        uOpacity: { value: 1.0 },
        uIsPoints: { value: false },
      },
      wireframe: renderMode === 'wireframe',
      transparent: true,
      side: THREE.DoubleSide,
    });
    shaderMaterialRef.current = shaderMaterial;

    // Animation & metrics loop
    let animationFrameId: number;
    let chunkCount = 0;
    let frameCount = 0;
    const framesPerChunk = 40;
    let lastFpsTime = performance.now();
    let fpsFrames = 0;
    const startTime = performance.now();

    let smoothedInterference = 0;
    let smoothedResonance = 1.0;
    let smoothedEntropy = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const nowTime = performance.now();
      const elapsedTime = (nowTime - startTime) / 1000;

      // Smooth damping on deformation & frequency
      const curDeform = shaderMaterial.uniforms.uDeformIntensity.value;
      const targetDeform = currentDeformRef.current;
      shaderMaterial.uniforms.uDeformIntensity.value += (targetDeform - curDeform) * 0.08;

      const curFreq = shaderMaterial.uniforms.uFrequency.value;
      const targetFreq = currentFreqRef.current;
      shaderMaterial.uniforms.uFrequency.value += (targetFreq - curFreq) * 0.08;

      shaderMaterial.uniforms.uTime.value = elapsedTime * speedRef.current;
      shaderMaterial.uniforms.uHasTexture.value = hasTextureRef.current;

      // Update cosmic audio synth dynamically with parameters
      cosmicSynth.updateParameters(
        shaderMaterial.uniforms.uFrequency.value,
        shaderMaterial.uniforms.uDeformIntensity.value
      );

      // Rotate model
      if (meshRef.current) {
        if (autoRotateRef.current) {
          meshRef.current.rotation.y += 0.004 * speedRef.current;
          meshRef.current.rotation.x += 0.0015 * speedRef.current;
        }
      }

      // Rotate background stars subtly
      if (backgroundFieldRef.current) {
        backgroundFieldRef.current.rotation.y += 0.0003;
      }

      controls.update();
      renderer.render(scene, camera);

      // FPS tracking
      fpsFrames++;
      const now = performance.now();
      let currentFps = 60.0;
      if (now >= lastFpsTime + 600) {
        currentFps = (fpsFrames * 1000) / (now - lastFpsTime);
        fpsFrames = 0;
        lastFpsTime = now;
      }

      // Live empirical calculations
      const activeDeform = shaderMaterial.uniforms.uDeformIntensity.value;
      const activeFreq = shaderMaterial.uniforms.uFrequency.value;
      const calcInterference = hasTextureRef.current
        ? Math.min(100, Math.max(0, 62 + Math.sin(elapsedTime * 1.5) * 16 + activeDeform * 5.2))
        : Math.min(100, Math.max(0, Math.sin(elapsedTime * 1.2) * 6 + 3.5));

      const calcResonance = 1.0 + activeDeform * activeFreq * 0.125;
      const calcEntropy = Math.abs(Math.cos(elapsedTime * 0.6)) * 0.024 + activeDeform * 0.0055;
      const calcCurvature = 1.0 + Math.sin(elapsedTime * 0.8) * 0.25 * activeDeform;
      const calcFlux = Math.abs(Math.sin(elapsedTime * 2.0)) * 48.0 + activeFreq * 6.5;

      smoothedInterference += (calcInterference - smoothedInterference) * 0.1;
      smoothedResonance += (calcResonance - smoothedResonance) * 0.1;
      smoothedEntropy += (calcEntropy - smoothedEntropy) * 0.1;

      // Metric throttled dispatch
      frameCount++;
      if (frameCount % 6 === 0) {
        onMetricsUpdate({
          interference: smoothedInterference,
          resonance: smoothedResonance,
          entropy: smoothedEntropy,
          fps: Math.min(currentFps, 120),
          coherence: hasTextureRef.current ? 98.4 - activeDeform * 1.8 : 88.0,
          topologicalCurvature: calcCurvature,
          quantumFlux: calcFlux,
        });
      }

      // Chunk commitment
      if (frameCount >= framesPerChunk) {
        frameCount = 0;
        chunkCount++;
        const stability = hasTextureRef.current
          ? activeDeform > 3.0
            ? 'تداخل وعي فائق الاضطراب'
            : 'تداخل وعي مستقر'
          : 'مادة مظلمة خام غير متفاعلة';
        onChunkCommit(chunkCount, stability);
      }
    };

    animate();

    // Resize observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  // Update geometry when geometryType, renderMode, scaleX, scaleY, scaleZ change
  const buildGeometry = useCallback(() => {
    if (!sceneRef.current || !shaderMaterialRef.current) return;

    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
    }

    let geom: THREE.BufferGeometry;
    switch (geometryType) {
      case 'box':
        geom = new THREE.BoxGeometry(1.5, 1.5, 1.5, 48, 48, 48);
        break;
      case 'torus':
        geom = new THREE.TorusGeometry(1.1, 0.45, 40, 100);
        break;
      case 'torusKnot':
        geom = new THREE.TorusKnotGeometry(0.9, 0.32, 128, 32, 2, 3);
        break;
      case 'icosahedron':
        geom = new THREE.IcosahedronGeometry(1.4, 24);
        break;
      case 'cylinder':
        geom = new THREE.CylinderGeometry(0.9, 0.9, 2.0, 64, 48, false);
        break;
      case 'sphere':
      default:
        geom = new THREE.SphereGeometry(1.4, 80, 80);
        break;
    }

    const mat = shaderMaterialRef.current;
    mat.wireframe = renderMode === 'wireframe';
    mat.uniforms.uIsPoints.value = renderMode === 'points';
    mat.uniforms.uOpacity.value = renderMode === 'glow' ? 0.75 : 1.0;
    mat.blending = renderMode === 'glow' ? THREE.AdditiveBlending : THREE.NormalBlending;

    let newMesh: THREE.Object3D;
    if (renderMode === 'points') {
      newMesh = new THREE.Points(geom, mat);
    } else {
      newMesh = new THREE.Mesh(geom, mat);
    }

    newMesh.scale.set(scaleX, scaleY, scaleZ);
    sceneRef.current.add(newMesh);
    meshRef.current = newMesh;
  }, [geometryType, renderMode, scaleX, scaleY, scaleZ]);

  useEffect(() => {
    buildGeometry();
  }, [buildGeometry]);

  // Update theme colors
  useEffect(() => {
    if (!shaderMaterialRef.current) return;
    const colors = THEME_COLORS[colorTheme];
    shaderMaterialRef.current.uniforms.uColorA.value = colors.a;
    shaderMaterialRef.current.uniforms.uColorB.value = colors.b;
    shaderMaterialRef.current.uniforms.uColorAccent.value = colors.accent;
  }, [colorTheme]);

  // Handle imperatively exposed actions
  useImperativeHandle(ref, () => ({
    captureSnapshot: () => {
      if (!canvasRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      rendererRef.current.render(sceneRef.current, cameraRef.current);
      const dataUrl = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `The-Proof-Framework-Snapshot-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    },

    startVideoRecording: () => {
      if (!canvasRef.current) return false;
      try {
        const stream = canvasRef.current.captureStream(30);
        let mimeType = 'video/webm; codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }
        const recorder = new MediaRecorder(stream, { mimeType });
        recordedChunksRef.current = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            recordedChunksRef.current.push(e.data);
          }
        };

        recorder.onstop = () => {
          if (recordedChunksRef.current.length === 0) return;
          const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `The-Truth-Matrix-v32.0-ProofOfInterference.webm`;
          a.click();
          URL.revokeObjectURL(url);
          onRecordingStatusChange(false, 0);
        };

        recorder.start(100);
        mediaRecorderRef.current = recorder;
        recordStartTimeRef.current = Date.now();
        onRecordingStatusChange(true, 0);

        if (recordTimerRef.current) clearInterval(recordTimerRef.current);
        recordTimerRef.current = window.setInterval(() => {
          const elapsed = Math.floor((Date.now() - recordStartTimeRef.current) / 1000);
          onRecordingStatusChange(true, elapsed);
        }, 1000);

        return true;
      } catch (err) {
        console.error('Error starting video recording:', err);
        return false;
      }
    },

    stopVideoRecording: () => {
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null;
      }
    },

    injectTexture: (texture: THREE.Texture, _name: string) => {
      if (shaderMaterialRef.current) {
        shaderMaterialRef.current.uniforms.uTexture.value = texture;
        shaderMaterialRef.current.uniforms.uHasTexture.value = true;
      }
    },

    resetCamera: () => {
      if (cameraRef.current && controlsRef.current) {
        cameraRef.current.position.set(0, 0, 4.3);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    },
  }));

  return (
    <div ref={mountRef} className="relative w-full h-full bg-[#040406] overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-grab active:cursor-grabbing outline-none"
      />
    </div>
  );
});
