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
import { MccConfirm } from '../../../../shared/components/modal-child-components/mcc-confirm/mcc-confirm';
import { PomodoroEngine, PomodoroPhase } from '../../../../core/services/pomodoro-engine';


@Component({
  selector: 'app-todo-details',
  imports: [DatePipe, PillBtn, TodoCard, IconBtn, TodoCardGrid],
  providers: [PomodoroEngine],
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
  public readonly pomodoroEngine = inject(PomodoroEngine);

  protected readonly taskId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id') ?? '')),
    { initialValue: '' },
  );
  protected readonly taskIdNew = computed(() => this.route.snapshot.paramMap.get('id'));
  protected readonly task = computed(() =>
    this.todoService.allToDos().find((t) => t.id === this.taskId()),
  );

  public ngOnInit() {
    this.pomodoroEngine.Initialize({
      onStart: () => {
        if(this.pomodoroEngine.CurrentPhase() === PomodoroPhase.Focus){
          this.snackbarService.showInfo("Focus phase started.");
        }
        else{
          this.snackbarService.showInfo("Break phase started.");
        }
      },
      onInterrupted: ()=> {
        this.snackbarService.showWarning("Focus interrupted.");
      },
      onMinimumFocus: () => {
        this.snackbarService.showWarning(`${this.pomodoroEngine.ElapsedSeconds()} seconds of focus session completed`);
        this.logSession(this.taskId());
      },
      onSessionComplete: () => {
        this.logSession(this.taskId());
      }
    });
  }
  public handleAbandon(): void {
    const currentTaskInstance = this.task();
    if (!currentTaskInstance) return;
    const modalOpts: ModalOptions = {
      title: 'Abandon task?',
      closeOnOverlayClick: false,
      maxWidth: 'sm',
    };
    const mccPayload: IPayloadContainer<string> = {
      payload: 'Are you sure you want to abandon this task?',
    };
    const dialog = this.modal.show(MccConfirm, modalOpts, mccPayload);
    dialog.onResult.then((response) => {
      if (response) {
        this.todoService.abandonToDoTask(currentTaskInstance.id, (response) => {
          if (response.isSuccess) {
            this.snackbarService.showInfo('Task has been abandoned.');
          } else {
            this.snackbarService.showError(
              `Failed to abandon task: ${response.errors?.join(', ')}`,
            );
          }
        });
      } else {
        this.snackbarService.showSuccess('Good on you for not abandoning a task!');
      }
    });
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
    this.pomodoroEngine.PauseTimer();
    const currentTaskId = this.taskId();
    const elapsedSeconds = this.pomodoroEngine.ElapsedSeconds();
    const isClockRunning = this.pomodoroEngine.IsClockRunning();
    const currentPhase = this.pomodoroEngine.CurrentPhase();
    if (isClockRunning) {
      if (elapsedSeconds >= this.pomodoroEngine.MinFocusDuration && currentPhase === PomodoroPhase.Focus) {
        this.completeTask(currentTaskId, elapsedSeconds / 60);
      } else if (
        elapsedSeconds < this.pomodoroEngine.MinFocusDuration &&
        currentPhase === PomodoroPhase.Focus
      ) {
        this.completeTask(currentTaskId);
      } else if (currentPhase === PomodoroPhase.Break) {
        this.completeTask(currentTaskId, 25);
      }
    } else {
      this.completeTask(currentTaskId);
    }
  }
  private logSession(currentTaskId: string): void {
    const elapsedTime = Math.floor(
      (this.pomodoroEngine.TotalCurrentPhaseSeconds() - this.pomodoroEngine.RemainingSeconds()) / 60,
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
  public EmergencyLogSession(){
    this.pomodoroEngine.PauseTimer();
    this.snackbarService.showWarning(`Session interrupted. Logging eligible progress slot: ${this.pomodoroEngine.DisplayTime()}`);
    this.logSession(this.taskId());
  }
}
