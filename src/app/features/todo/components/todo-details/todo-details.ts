import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TodoService } from '../../../../core/services/todo.service';
import { DatePipe } from '@angular/common';
import { ToDoTaskDto, UpdateToDoTaskDetailsCommand } from '../../../../core/models/todo.model';
import { PillBtn } from '../../../../shared/components/pill-btn/pill-btn';
import { GoogleIcons } from '../../../../core/models/google.material.icons';
import { TodoCard } from '../../../../shared/components/todo-card/todo-card';
import { IconBtn } from '../../../../shared/components/icon-btn/icon-btn';
import { ModalService } from '../../../../core/services/modal';
import { CreateTodoForm } from '../create-todo-form/create-todo-form';
import { IPayloadContainer, ModalOptions } from '../../../../core/models/system.modal.design';
import { SessionService } from '../../../../core/services/session.service';
import { LogPomodoroSessionCommand } from '../../../../core/models/session.model';
import { SnackbarService } from '../../../../core/services/snackbar';
import { map, tap } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { TodoCardGrid } from '../../../../shared/components/todo-card-grid/todo-card-grid';
import { ToggleIconBtn } from '../../../../shared/components/toggle-icon-btn/toggle-icon-btn';


export type PomodoroPhase = 'FOCUS' | 'BREAK';
@Component({
  selector: 'app-todo-details',
  imports: [DatePipe, PillBtn, TodoCard, IconBtn, TodoCardGrid, ToggleIconBtn],
  templateUrl: './todo-details.html',
  styleUrl: './todo-details.css',
})
export class TodoDetails {
  protected readonly Math = Math;
  protected readonly GoogleIcons = GoogleIcons;
  //Service injections
  private readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly todoService = inject(TodoService);
  protected readonly sessionService = inject(SessionService);
  protected readonly snackbarService = inject(SnackbarService);
  protected readonly nav = inject(Router);
  protected readonly modal = inject(ModalService);

  // To-Do object variables
  protected readonly taskId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );
  protected readonly task = computed(() =>
    this.todoService.allToDos().find((t) => t.id === this.taskId()),
  );

  //Timer Variables
  // private readonly focusDuration: number = 25 * 60;
  // private readonly breakDuration: number = 5 * 60;
  private readonly focusDuration: number = 60;
  private readonly breakDuration: number = 60;
  private readonly minSessionSeconds = 60 * 1;
  protected readonly currentPhase = signal<PomodoroPhase>('FOCUS');
  protected readonly remainingSeconds = signal<number>(this.focusDuration);
  protected readonly isClockRunning = signal<boolean>(false);
  protected readonly textDisplay = signal<string>('Start');
  protected readonly canTagTaskComplete = signal<boolean>(false);
  protected readonly elapsedSeconds = computed(() => this.focusDuration - this.remainingSeconds());

  private timerIntervalId: any = null;

  protected readonly totalCurrentPhaseSeconds = computed(() =>
    this.currentPhase() === 'FOCUS' ? this.focusDuration : this.breakDuration,
  );

  protected readonly progressPercent = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const elapsed = total - this.remainingSeconds();
    const computedPercentage = (elapsed / total) * 100;
    return Math.min(100, Math.max(0, computedPercentage));
  });

  protected readonly displayTime = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const remaining = this.remainingSeconds();
    const minutes = Math.floor((total - remaining) / 60);
    const seconds = (total - remaining) % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });

  protected readonly displayRemainingTime = computed(() => {
    const total = this.totalCurrentPhaseSeconds();
    const remaining = this.remainingSeconds();
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  });
  public onToggleClock(): void {
    if (this.isClockRunning() && this.currentPhase() === 'FOCUS') {
      this.snackbarService.showWarning(`Session interrupted.`);
      this.textDisplay.set('Start');
      this.onResetClock();
    } else {
      this.textDisplay.set(this.currentPhase());
      this.startTimer();
    }
  }

  private startTimer(): void {
    if (this.timerIntervalId) clearInterval(this.timerIntervalId);
    this.isClockRunning.set(true);
    this.timerIntervalId = setInterval(() => {
      if (this.elapsedSeconds() >= 60) this.canTagTaskComplete.set(true);
      if (this.remainingSeconds() > 0) this.remainingSeconds.update((current) => current - 1);
      else this.onSessionComplete();
    }, 1000);
  }
  private pauseTimer(): void {
    this.isClockRunning.set(false);
    if (this.timerIntervalId) {
      clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
  }
  public onResetClock(): void {
    this.pauseTimer();
    this.remainingSeconds.set(this.totalCurrentPhaseSeconds());
  }
  private onSessionComplete(): void {
    this.pauseTimer();
    this.ringBell();
    if (this.currentPhase() === 'FOCUS') {
      const currentTaskId = this.taskId();
      this.logSession(currentTaskId);
      this.currentPhase.set('BREAK');
      this.remainingSeconds.set(this.breakDuration);
    } else {
      this.currentPhase.set('FOCUS');
      this.remainingSeconds.set(this.focusDuration);
    }
    this.textDisplay.set(this.currentPhase());

    // insert Api call for incrementing session count here

    this.onResetClock();
    this.startTimer();
  }
  // protected markSessionComplete(): void {
  //   this.pauseTimer();
  //   // insert Api call for incrementing session count here
  // }

  public ringBell(): void {
    const audio = new Audio();
    audio.src = 'assets/audio/break_bell.mp3';
    audio.load();
    audio.play().catch((error) => {
      console.log('Audio playback failed', error);
    });
  }
  public ngOnDestroy(): void {
    this.pauseTimer();
  }
  public handleModifyTask(): void {
    const currentTaskInstance = this.task();
    if (!currentTaskInstance) return;
    const modalOptions: ModalOptions = {
      title: 'Update Task',
      closeOnOverlayClick: false,
      maxWidth: 'md',
    };
    const payload: IPayloadContainer<ToDoTaskDto> = { payload: currentTaskInstance };
    const dialog = this.modal.show(CreateTodoForm, modalOptions, payload);
    dialog.onResult.then((updatedTask: UpdateToDoTaskDetailsCommand) => {
      this.todoService.updateToDoTask(updatedTask, (response) => {
        if (response.isSuccess) {
          this.snackbarService.showSuccess('Task updated successfully!');
        } else {
          this.snackbarService.showWarning('Failed to updated task');
        }
      });
    });
  }
  public handleDeleteTask() {
    const id = this.taskId();
    this.todoService.deleteToDoTask(id, (response) => {
      if (response.isSuccess) {
        console.log('Task Deleted');
        this.nav.navigate(['/todos']);
      }
    });
  }
  protected markTaskComplete(): void {
    this.pauseTimer();
    const currentTaskId = this.taskId();
    const elapsedSeconds = this.elapsedSeconds();
    const isClockRunning = this.isClockRunning();
    const currentPhase = this.currentPhase();
    if (isClockRunning) {
      if (elapsedSeconds >= this.minSessionSeconds && currentPhase === 'FOCUS') {
        this.completeTask(currentTaskId, elapsedSeconds / 60);
      } else if (elapsedSeconds < this.minSessionSeconds && currentPhase === 'FOCUS') {
        this.completeTask(currentTaskId);
      } else if (currentPhase === 'BREAK') {
        this.completeTask(currentTaskId, 25);
      }
    } else {
      this.completeTask(currentTaskId);
    }
  }
  private logSession(currentTaskId: string): void {
    const elapsedTime = Math.floor(
      (this.totalCurrentPhaseSeconds() - this.remainingSeconds()) / 60,
    );
    const logSessionCommand: LogPomodoroSessionCommand = {
      ToDoTaskId: currentTaskId,
      DurationMinutes: elapsedTime,
    };
    this.sessionService.logSession(logSessionCommand, (response) => {
      if (response.isSuccess)
        this.snackbarService.showSuccess(
          `Session successfully logged with id: ${response.payload}`,
        );
      else {
        const errorText = response.errors?.join(', ') || 'Failed to log session for this task.';
        this.snackbarService.showError(errorText);
      }
    });
  }

  private completeTask(taskId: string, sessionDuration?: number): void {
    if (sessionDuration) {
      this.todoService.tagToDoTaskWithSessionComplete(taskId, sessionDuration, (response) => {
        if (response.isSuccess) {
          this.snackbarService.showSuccess(
            'Task has been tagged as completed and a session has been logged!',
          );
          this.router.navigate(['/todos']);
        } else {
          this.snackbarService.showError('Failed tagging task as completed.');
        }
      });
    } else {
      this.todoService.tagToDoTaskComplete(taskId, (response) => {
        if (response.isSuccess) {
          this.snackbarService.showSuccess('Task has been tagged as completed!');
          this.router.navigate(['/todos']);
        } else {
          this.snackbarService.showError('Failed tagging task as completed.');
        }
      });
    }
  }

  public handleToggle(task: ToDoTaskDto): void{
    this.todoService.localUpdateToDoTask(task);
  }
}
