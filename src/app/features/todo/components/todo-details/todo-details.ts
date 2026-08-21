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


export type PomodoroPhase = 'FOCUS' | 'BREAK';
@Component({
  selector: 'app-todo-details',
  imports: [DatePipe, PillBtn, TodoCard, IconBtn],
  templateUrl: './todo-details.html',
  styleUrl: './todo-details.css',
})
export class TodoDetails {
  protected readonly Math = Math;
  protected readonly GoogleIcons = GoogleIcons;
  //Service injections
  private readonly route = inject(ActivatedRoute);
  protected readonly todoService = inject(TodoService);
  protected readonly nav = inject(Router);
  protected readonly modal = inject(ModalService);

  // To-Do object variables
  private readonly taskId = computed(() => this.route.snapshot.paramMap.get('id'));
  protected readonly task = computed(() => this.todoService.allToDos().find((t) => t.id === this.taskId()));

  //Timer Variables
  // private readonly focusDuration: number = 25 * 60;
  // private readonly breakDuration: number = 5 * 60;
  private readonly focusDuration: number = 10;
  private readonly breakDuration: number = 5;
  protected readonly currentPhase = signal<PomodoroPhase>('FOCUS')
  protected readonly remainingSeconds = signal<number>(this.focusDuration);
  protected readonly isClockRunning = signal<boolean>(false);

  private timerIntervalId: any = null;

  protected readonly totalCurrentPhaseSeconds = computed(() => this.currentPhase() === 'FOCUS' ? this.focusDuration : this.breakDuration);

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
  public onToggleClock(): void {
    if (this.isClockRunning()) this.pauseTimer();
    else this.startTimer();
  }

  private startTimer(): void {
    if(this.timerIntervalId) clearInterval(this.timerIntervalId);
    this.isClockRunning.set(true);
    this.timerIntervalId = setInterval(() => {
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
    if(this.currentPhase() === 'FOCUS')
    {
      this.currentPhase.set('BREAK');
      this.remainingSeconds.set(this.breakDuration);
    }
    else {
      this.currentPhase.set('FOCUS');
      this.remainingSeconds.set(this.focusDuration);
    }

    // insert Api call for incrementing session count here

    this.onResetClock();
    this.startTimer();
  }
  protected markSessionComplete(): void {
    this.pauseTimer();
    // insert Api call for incrementing session count here
  }

  public ringBell(): void {
    const audio = new Audio();
    audio.src = "assets/audio/break_bell.mp3";
    audio.load();
    audio.play().catch(
      error => {
      console.log("Audio playback failed", error)
      }
    );
  }
  public ngOnDestroy(): void {
    this.pauseTimer();
  }
  public handleModifyTask(): void{
    const currentTaskInstance = this.task();
    if(!currentTaskInstance) return;
    const modalOptions: ModalOptions = {
      title: "Update Task",
      closeOnOverlayClick: false,
      maxWidth: "md"
    }
    const payload: IPayloadContainer<ToDoTaskDto> = { payload: currentTaskInstance };
    const dialog = this.modal.show(CreateTodoForm, modalOptions,payload);
    dialog.onResult.then((updatedTask: UpdateToDoTaskDetailsCommand) => {
      this.todoService.updateToDoTask(updatedTask, (response) => {
        if(response.isSuccess){
          console.log("Task Updated successfully!");
        }
      });
    });
  }
  public handleDeleteTask(){
    const id = this.taskId();
    this.todoService.deleteToDoTask(id, (response) => {
      if(response.isSuccess){
        console.log("Task Deleted");
        this.nav.navigate(["/todos"])
      }
    });
  }

}
