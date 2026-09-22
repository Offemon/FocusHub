import { Component, inject, input } from '@angular/core';
import { PomodoroEngine, TimerConfig } from '../../../core/services/pomodoro-engine';
import { GoogleIcons } from '../../../core/models/google.material.icons';

@Component({
  selector: 'app-session-player',
  providers: [PomodoroEngine],
  imports: [],
  templateUrl: './session-player.html',
  styleUrl: './session-player.css',
})
export class SessionPlayer {
  private readonly defaultTimerConfig: TimerConfig = {
    onStart: () => {},
    onInterrupted: () => {},
    onMinimumFocus: () => {},
    onSessionComplete: () => {},
  };
  public readonly TimerConfig = input<TimerConfig>(this.defaultTimerConfig);
  protected readonly pomodoroEngine = inject(PomodoroEngine);

  ngOnInit() {
    this.pomodoroEngine.Initialize({
        ...this.TimerConfig(),
      });

  }

  protected readonly GoogleIcons = GoogleIcons;
}
