class CosmicDroneSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private oscRoot: OscillatorNode | null = null;
  private oscFifth: OscillatorNode | null = null;
  private oscSub: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private isRunning = false;

  public start(volume = 0.25) {
    if (this.isRunning) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 1.5);
      this.masterGain.connect(this.ctx.destination);

      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(540, this.ctx.currentTime);
      this.filter.Q.setValueAtTime(2.5, this.ctx.currentTime);
      this.filter.connect(this.masterGain);

      // Root tone (A2 ~ 108Hz or 216Hz for rich cosmic hum)
      this.oscRoot = this.ctx.createOscillator();
      this.oscRoot.type = 'sine';
      this.oscRoot.frequency.setValueAtTime(108, this.ctx.currentTime);

      // Subtle fifth (162Hz)
      this.oscFifth = this.ctx.createOscillator();
      this.oscFifth.type = 'sine';
      this.oscFifth.frequency.setValueAtTime(162, this.ctx.currentTime);

      // Deep sub bass
      this.oscSub = this.ctx.createOscillator();
      this.oscSub.type = 'triangle';
      this.oscSub.frequency.setValueAtTime(54, this.ctx.currentTime);

      const subGain = this.ctx.createGain();
      subGain.gain.value = 0.4;
      this.oscSub.connect(subGain);
      subGain.connect(this.filter);

      const fifthGain = this.ctx.createGain();
      fifthGain.gain.value = 0.3;
      this.oscFifth.connect(fifthGain);
      fifthGain.connect(this.filter);

      this.oscRoot.connect(this.filter);

      this.oscRoot.start();
      this.oscFifth.start();
      this.oscSub.start();

      this.isRunning = true;
    } catch (e) {
      console.warn('Web Audio synth could not initialize:', e);
    }
  }

  public updateParameters(freq: number, deform: number) {
    if (!this.isRunning || !this.ctx || !this.filter || !this.oscRoot) return;
    const now = this.ctx.currentTime;
    // Map frequency (0.5 to 8) to harmonic shift
    const baseFreq = 108 * (1 + (freq - 2.0) * 0.08);
    this.oscRoot.frequency.setTargetAtTime(Math.max(50, Math.min(300, baseFreq)), now, 0.2);
    if (this.oscFifth) {
      this.oscFifth.frequency.setTargetAtTime(baseFreq * 1.5, now, 0.2);
    }
    // Modulate filter cutoff with deformation
    const cutoff = 400 + deform * 220;
    this.filter.frequency.setTargetAtTime(cutoff, now, 0.15);
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  public stop() {
    if (!this.isRunning || !this.ctx || !this.masterGain) return;
    try {
      this.masterGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.8);
      setTimeout(() => {
        this.oscRoot?.stop();
        this.oscFifth?.stop();
        this.oscSub?.stop();
        this.ctx?.close();
        this.isRunning = false;
        this.ctx = null;
      }, 900);
    } catch {
      this.isRunning = false;
    }
  }
}

export const cosmicSynth = new CosmicDroneSynth();
