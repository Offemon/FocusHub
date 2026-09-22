import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { map, Subject, Subscription, takeUntil, tap, timer } from 'rxjs';

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
  // private readonly focusDuration: number = 1 * 60;
  // private readonly breakDuration: number = 1 * 60;
  // private readonly minFocusDuration: number = 5;
  private readonly focusStartAudio = new Audio('assets/audio/focus-start.mp3');
  private readonly breakBellAudio = new Audio('assets/audio/break_bell.mp3');

  private readonly currentPhase = signal<PomodoroPhaseType>(PomodoroPhase.Focus);
  private readonly remainingSeconds = signal<number>(this.focusDuration);
  private readonly isClockRunning = signal<boolean>(false);
  private readonly elapsedSeconds = computed(
    () => this.totalCurrentPhaseSeconds() - this.remainingSeconds(),
  );
  private readonly canTagTaskComplete = signal<boolean>(false);
  private config: TimerConfig | null = null;

  private timerSubscription: Subscription | null = null;
  private readonly destroy$ = new Subject<void>();

  private readonly totalCurrentPhaseSeconds = computed(() =>
    this.currentPhase() === PomodoroPhase.Focus ? this.focusDuration : this.breakDuration,
  );
  public readonly FocusDuration = this.focusDuration;
  public readonly BreakDuration = this.breakDuration;
  public readonly MinFocusDuration = this.minFocusDuration;
  public readonly CurrentPhase = computed(() => this.currentPhase());
  public readonly TotalCurrentPhaseSeconds = computed(() => this.totalCurrentPhaseSeconds());
  public readonly RemainingSeconds = computed(() => this.remainingSeconds());
  public readonly IsClockRunning = computed(() => this.isClockRunning());
  public readonly ElapsedSeconds = computed(() => this.elapsedSeconds());
  public readonly CanTagTaskComplete = computed(() => this.canTagTaskComplete());

  public readonly DisplayProgressPercent = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const elapsed = this.elapsedSeconds();
    const computedPercentage = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, computedPercentage));
  });

  public readonly DisplayTime = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const remaining = this.remainingSeconds();
    const minutes = Math.floor((total - remaining) / 60);
    const seconds = (total - remaining) % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  public readonly DisplayRemainingTime = computed(() => {
    const remaining = this.remainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  public Initialize(timerConfig: TimerConfig) {
    this.config = timerConfig;
  }
  public OnToggleTimer(): void {
    if (this.isClockRunning() && this.remainingSeconds() > 0) {
      if (this.currentPhase() === PomodoroPhase.Focus) {
        if (this.elapsedSeconds() >= this.minFocusDuration) {
          this.config?.onMinimumFocus();
        } else {
          this.config?.onInterrupted();
        }
      }
      this.ResetTimer();
    } else {
      this.startTimer();
    }
  }
  private startTimer(): void{
    this.stopTimerSubscription();
    this.isClockRunning.set(true);
    this.config?.onStart();
    if (this.currentPhase() === PomodoroPhase.Focus) {
      this.ringFocusSound();
    } else {
      this.ringBreakBell();
    }
    const startSeconds = this.remainingSeconds();
    const startTimeStamp = Date.now();

    this.timerSubscription = timer(0, 200)
      .pipe(
        map(() => {
          const secondsElapsed = Math.floor((Date.now() - startTimeStamp) / 1000);
          return Math.max(0, startSeconds - secondsElapsed);
        }),
        tap((newRemainingSeconds) => {
          this.remainingSeconds.set(newRemainingSeconds);
          if (
            this.currentPhase() === PomodoroPhase.Focus &&
            this.elapsedSeconds() >= this.minFocusDuration
          )
            this.canTagTaskComplete.set(true);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (newRemainingSeconds) => {
          if (newRemainingSeconds === 0) this.phaseComplete();
        },
      });
  }
  public ResetTimer() {
    this.PauseTimer();
    this.currentPhase.set(PomodoroPhase.Focus);
    this.remainingSeconds.set(this.focusDuration);
  }
  public PauseTimer(): void {
    this.isClockRunning.set(false);
    this.stopTimerSubscription();
  }
  private phaseComplete(): void {
    this.PauseTimer();
    if (this.currentPhase() === PomodoroPhase.Focus) {
      this.config?.onSessionComplete();
      // this.ringBreakBell();
      this.currentPhase.set(PomodoroPhase.Break);
      this.remainingSeconds.set(this.breakDuration);
    } else {
      // this.ringFocusSound();
      this.canTagTaskComplete.set(false);
      this.currentPhase.set(PomodoroPhase.Focus);
      this.remainingSeconds.set(this.focusDuration);
    }
    this.startTimer();
  }
  private stopTimerSubscription(): void{
    if(this.timerSubscription){
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }
  private ringBreakBell(): void {
    this.breakBellAudio.currentTime = 0;
    this.breakBellAudio.play().catch((error) => {
      console.log('Audio playback failed', error);
    });
  }
  private ringFocusSound(): void {
    // audio.volume = 0.5;
    this.focusStartAudio.currentTime = 0;
    this.focusStartAudio.play().catch((error) => {
      console.log('Audio playback failed', error);
    });
  }
  public ngOnDestroy() {
    this.PauseTimer();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
