import { CanDeactivateFn } from '@angular/router';
import { TodoDetails } from '../../features/todo/components/todo-details/todo-details';
import { PomodoroPhase } from '../services/pomodoro-engine';

export const PomodoroNavigationGuard: CanDeactivateFn<TodoDetails> = (component) => {
  const engine = component.pomodoroEngine;

  if(engine.IsClockRunning() && engine.CanTagTaskComplete() && engine.CurrentPhase() === PomodoroPhase.Focus){
    component.EmergencyLogSession();
  }
  return true;
}
