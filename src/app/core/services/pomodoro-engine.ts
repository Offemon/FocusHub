import { computed, Injectable, OnDestroy, signal } from '@angular/core';

export const PomodoroPhase = {
  Focus: "FOCUS",
  Break: "BREAK"
} as const
export interface TimerConfig{
  onStart: ()=>void;
  onInterrupted: ()=>void;
  onMinimumFocus: () => void;
  onSessionComplete: ()=>void;
}
export type PomodoroPhaseType = typeof PomodoroPhase[keyof typeof PomodoroPhase];

@Injectable()
export class PomodoroEngine implements OnDestroy {
  private readonly focusDuration: number = 25 * 60;
  private readonly breakDuration: number = 5 * 60;
  private readonly minFocusDuration: number = 10 * 60;

  private readonly currentPhase = signal<PomodoroPhaseType>(PomodoroPhase.Focus);
  private readonly remainingSeconds = signal<number>(this.focusDuration);
  private readonly isClockRunning = signal<boolean>(false);
  private readonly elapsedSeconds = computed(
    () => this.totalCurrentPhaseSeconds() - this.remainingSeconds(),
  );
  private readonly canTagTaskComplete = signal<boolean>(false);
  private config: TimerConfig | null = null;
  private timerInstance: any = null;

  private readonly totalCurrentPhaseSeconds = computed(() =>
    this.currentPhase() === PomodoroPhase.Focus ? this.focusDuration : this.breakDuration,
  );
  public displayPhase = computed(() => this.currentPhase());
  public readonly progressPercent = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const elapsed = this.elapsedSeconds();
    const computedPercentage = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, computedPercentage));
  });

  public readonly displayTime = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const remaining = this.remainingSeconds();
    const minutes = Math.floor((total - remaining) / 60);
    const seconds = (total - remaining) % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  public readonly displayRemainingTime = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const remaining = this.remainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  public initialize(timerConfig: TimerConfig) {
    this.config = timerConfig;
  }
  public onToggleTimer(): void {
    if (this.isClockRunning() && this.remainingSeconds() > 0) {
      if (this.currentPhase() === PomodoroPhase.Focus) {
        if (this.elapsedSeconds() >= this.minFocusDuration) {
          this.config?.onMinimumFocus();
        } else {
          this.config?.onInterrupted();
        }
      }
      this.resetTimer();
    } else {
      this.startTimer();
    }
  }
  private startTimer(): void {
    if (this.timerInstance) clearInterval(this.timerInstance);
    this.isClockRunning.set(true);
    this.config?.onStart();
    this.timerInstance = setInterval(() => {
      if (
        this.elapsedSeconds() >= this.minFocusDuration &&
        this.currentPhase() === PomodoroPhase.Focus
      )
        this.canTagTaskComplete.set(true);
      if (this.remainingSeconds() > 0) this.remainingSeconds.update((current) => current - 1);
      else this.phaseComplete();
    }, 1000);
  }
  private resetTimer() {
    this.pauseTimer();
    this.currentPhase.set(PomodoroPhase.Focus);
    this.remainingSeconds.set(this.focusDuration);
  }
  public pauseTimer(): void {
    this.isClockRunning.set(false);
    if (this.timerInstance) {
      clearInterval(this.timerInstance);
      this.timerInstance = null;
    }
  }
  private phaseComplete(): void {
    this.pauseTimer();
    if (this.currentPhase() === PomodoroPhase.Focus) {
      this.config?.onSessionComplete();
      this.ringBreakBell();
      this.currentPhase.set(PomodoroPhase.Break);
      this.remainingSeconds.set(this.breakDuration);
    } else {
      this.ringFocusSound();
      this.canTagTaskComplete.set(false);
      this.currentPhase.set(PomodoroPhase.Focus);
      this.remainingSeconds.set(this.focusDuration);
    }
    this.startTimer();
  }
  private ringBreakBell(): void {
    const audio = new Audio();
    audio.src = 'assets/audio/break_bell.mp3';
    audio.load();
    audio.play().catch((error) => {
      console.log('Audio playback failed', error);
    });
  }
  private ringFocusSound(): void {
    const audio = new Audio();
    audio.src = 'assets/audio/focus_start.mp3';
    audio.load();
    audio.volume = 0.5;
    audio.play().catch((error) => {
      console.log('Audio playback failed', error);
    });
  }
  public ngOnDestroy() {
    this.resetTimer();
  }
}
