export type SoundCue = 'hit' | 'attack' | 'magic' | 'pickup' | 'craft' | 'level' | 'hurt' | 'quest' | 'mine' | 'dodge';

/** Short synthesized feedback, owned by the project; no external sound files. */
export class SoundFeedback {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private volume = .7;
  private muted = false;
  private ambient: OscillatorNode[] = [];
  private ambientGain: GainNode | null = null;
  private ambientZone = '';

  unlock(): void {
    try {
      this.context ??= new AudioContext();
      if (!this.master) {
        this.master = this.context.createGain();
        this.master.gain.value = this.muted ? 0 : this.volume;
        this.master.connect(this.context.destination);
      }
      void this.context.resume().catch(() => undefined);
    } catch { /* The game remains playable if this device has no audio context. */ }
  }

  play(cue: SoundCue): void {
    if (!this.context || this.context.state !== 'running' || this.muted) return;
    const notes: Record<SoundCue, [number, number, number, OscillatorType]> = {
      hit: [190, 70, .10, 'triangle'], attack: [280, 80, .09, 'sawtooth'],
      magic: [400, 850, .18, 'sine'], pickup: [720, 1120, .12, 'sine'],
      craft: [440, 660, .20, 'triangle'], level: [520, 1040, .30, 'sine'],
      hurt: [120, 45, .14, 'sawtooth'], quest: [660, 1320, .28, 'sine'],
      mine: [170, 300, .07, 'triangle'], dodge: [360, 100, .10, 'triangle'],
    };
    const [from, to, duration, type] = notes[cue];
    const time = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(from, time);
    oscillator.frequency.exponentialRampToValueAtTime(to, time + duration);
    gain.gain.setValueAtTime(.0001, time);
    gain.gain.exponentialRampToValueAtTime(.045, time + .008);
    gain.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(gain).connect(this.master!);
    oscillator.start(time);
    oscillator.stop(time + duration + .02);
    oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
  }

  configure(settings: { volume: number; muted: boolean }): void {
    this.volume = settings.volume;
    this.muted = settings.muted;
    if (this.context && this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : this.volume, this.context.currentTime, .03);
  }

  /** Quiet original soundscape. The master gain also controls these voices. */
  setAmbience(zone: 'town' | 'forest' | 'dungeon'): void {
    if (!this.context || !this.master || this.ambientZone === zone) return;
    this.stopAmbience();
    this.ambientZone = zone;
    const notes = zone === 'town' ? [130.81, 164.81, 196] : zone === 'forest' ? [110, 130.81, 164.81] : [98, 116.54, 146.83];
    const gain = this.context.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(.006, this.context.currentTime, 1.1);
    gain.connect(this.master);
    this.ambientGain = gain;
    for (const [index, frequency] of notes.entries()) {
      const voice = this.context.createOscillator();
      voice.type = 'sine'; voice.frequency.value = frequency;
      voice.detune.value = index === 1 ? 3 : -2;
      voice.connect(gain); voice.start();
      this.ambient.push(voice);
    }
  }

  stopAmbience(): void {
    for (const voice of this.ambient) { voice.stop(); voice.disconnect(); }
    this.ambient = [];
    this.ambientGain?.disconnect(); this.ambientGain = null; this.ambientZone = '';
  }

  dispose(): void {
    this.stopAmbience();
    void this.context?.close(); this.context = null; this.master = null;
  }

  toggle(): boolean { this.configure({ volume: this.volume, muted: !this.muted }); return this.muted; }
}
