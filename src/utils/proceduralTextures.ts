import * as THREE from 'three';
import { PresetTexture } from '../types';

export const PRESET_TEXTURES: PresetTexture[] = [
  {
    id: 'neural',
    name: 'Neural Consciousness Tapestry',
    arabicName: 'نسيج الوعي العصبي البيولوجي',
    description: 'شبكة خلايا سينابسية تحاكي نبضات الإدراك البشري',
    type: 'neural',
  },
  {
    id: 'sacred',
    name: 'Sacred Holographic Matrix',
    arabicName: 'مصفوفة الهندسة المقدسة',
    description: 'دوائر زهرة الحياة وتناغم النسبة الذهبية الكونية',
    type: 'sacred',
  },
  {
    id: 'cosmic',
    name: 'Quantum Cosmic Singularity',
    arabicName: 'سديم الانفرادية الكمومية',
    description: 'دوامات الجاذبية المظلمة وجزيئات الغبار الطيفي',
    type: 'cosmic',
  },
  {
    id: 'cyber',
    name: 'Cybernetic Data Lattice',
    arabicName: 'شبكة البيانات السيبرانية',
    description: 'مصفوفة بصرية رقمية ذات مسارات ضوئية فائقة التوصيل',
    type: 'cyber',
  },
  {
    id: 'chromatic',
    name: 'Chromatic Spectral Stream',
    arabicName: 'التدفق اللوني الطيفي',
    description: 'أمواج ليزرية تداخلية تتفاعل مع معادلات الضغط',
    type: 'chromatic',
  },
];

export function createProceduralTexture(type: PresetTexture['type'], maxAnisotropy = 4): THREE.CanvasTexture {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#05050b';
  ctx.fillRect(0, 0, size, size);

  if (type === 'neural') {
    // Generate biomorphic neural nodes and synaptic connections
    const nodes: { x: number; y: number; r: number; color: string }[] = [];
    const colors = ['#00f2fe', '#9d4edd', '#4df0a6', '#ff007f', '#38bdf8'];
    for (let i = 0; i < 70; i++) {
      nodes.push({
        x: Math.random() * size,
        y: Math.random() * size,
        r: 3 + Math.random() * 6,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Axon branches
    ctx.lineWidth = 1.2;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.hypot(dx, dy);
        if (dist < 180) {
          const alpha = 1 - dist / 180;
          ctx.strokeStyle = `rgba(157, 78, 221, ${alpha * 0.7})`;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          // quadratic curve for organic look
          const cx = (nodes[i].x + nodes[j].x) / 2 + (Math.random() - 0.5) * 40;
          const cy = (nodes[i].y + nodes[j].y) / 2 + (Math.random() - 0.5) * 40;
          ctx.quadraticCurveTo(cx, cy, nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Glowing cell bodies
    for (const node of nodes) {
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.r * 4);
      grad.addColorStop(0, node.color);
      grad.addColorStop(0.3, node.color);
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'sacred') {
    // Flower of life and sacred geometric lattice
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.4)';
    ctx.lineWidth = 1.8;
    const center = size / 2;
    const radius = 100;

    // Center seed circles
    for (let layer = 1; layer <= 3; layer++) {
      const count = layer * 6;
      for (let i = 0; i < count; i++) {
        const angle = (i * 2 * Math.PI) / count;
        const cx = center + Math.cos(angle) * radius * layer * 0.9;
        const cy = center + Math.sin(angle) * radius * layer * 0.9;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // Outer golden concentric rings & rays
    for (let r = 50; r <= 460; r += 50) {
      ctx.strokeStyle = `rgba(255, 0, 127, ${0.15 + (r / 500) * 0.3})`;
      ctx.beginPath();
      ctx.arc(center, center, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Metatron diagonals
    ctx.strokeStyle = 'rgba(77, 240, 166, 0.35)';
    ctx.lineWidth = 1.0;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + Math.cos(a) * 480, center + Math.sin(a) * 480);
      ctx.stroke();
    }
  } else if (type === 'cosmic') {
    // Quantum cosmic swirl nebula
    const grad = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 1.5);
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    grad.addColorStop(0.15, 'rgba(0, 242, 254, 0.7)');
    grad.addColorStop(0.4, 'rgba(157, 78, 221, 0.6)');
    grad.addColorStop(0.7, 'rgba(255, 0, 127, 0.4)');
    grad.addColorStop(1, 'rgba(4, 4, 10, 0.9)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Stardust spirals
    for (let arm = 0; arm < 3; arm++) {
      const armOffset = (arm * 2 * Math.PI) / 3;
      for (let t = 0; t < 600; t++) {
        const angle = t * 0.05 + armOffset;
        const dist = Math.pow(t / 600, 0.8) * (size * 0.45);
        const x = size / 2 + Math.cos(angle) * dist + (Math.random() - 0.5) * 30;
        const y = size / 2 + Math.sin(angle) * dist + (Math.random() - 0.5) * 30;
        ctx.fillStyle = Math.random() > 0.3 ? 'rgba(0, 242, 254, 0.7)' : 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y, Math.random() * 2 + 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  } else if (type === 'cyber') {
    // Hexagonal cyber grid + data traces
    const hexRadius = 40;
    const h = hexRadius * Math.sqrt(3);
    ctx.strokeStyle = 'rgba(0, 242, 254, 0.18)';
    ctx.lineWidth = 1;

    for (let row = 0; row < size / h + 2; row++) {
      for (let col = 0; col < size / (hexRadius * 1.5) + 2; col++) {
        const x = col * hexRadius * 1.5;
        const y = row * h + (col % 2 === 1 ? h / 2 : 0);
        ctx.beginPath();
        for (let s = 0; s < 6; s++) {
          const a = (s * Math.PI) / 3;
          const px = x + hexRadius * Math.cos(a);
          const py = y + hexRadius * Math.sin(a);
          if (s === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
    }

    // Glowing cyber traces
    for (let i = 0; i < 25; i++) {
      const startX = Math.floor(Math.random() * 20) * 50;
      const startY = Math.floor(Math.random() * 20) * 50;
      ctx.strokeStyle = Math.random() > 0.5 ? '#00f2fe' : '#4df0a6';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(startX + (Math.random() > 0.5 ? 100 : -100), startY);
      ctx.lineTo(startX + 100, startY + (Math.random() > 0.5 ? 100 : -100));
      ctx.stroke();
    }
  } else {
    // Chromatic spectral gradients
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#ff007f');
    grad.addColorStop(0.25, '#9d4edd');
    grad.addColorStop(0.5, '#00f2fe');
    grad.addColorStop(0.75, '#4df0a6');
    grad.addColorStop(1, '#f59e0b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Interference wave bars
    for (let y = 0; y < size; y += 8) {
      const alpha = 0.2 + 0.2 * Math.sin(y * 0.05);
      ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
      ctx.fillRect(0, y, size, 4);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = maxAnisotropy;
  return texture;
}
