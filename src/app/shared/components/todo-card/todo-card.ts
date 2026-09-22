import { Component, ElementRef, HostListener, inject, input, signal } from '@angular/core';
import { ToDoTaskDto, UpdateToDoTaskDetailsCommand } from '../../../core/models/todo.model';
import { RouterLink } from '@angular/router';
import { GoogleIcons } from '../../../core/models/google.material.icons';
import { ModalService } from '../../../core/services/modal';
import { SnackbarService } from '../../../core/services/snackbar';
import { TodoService } from '../../../core/services/todo.service';
import { IPayloadContainer, ModalOptions } from '../../../core/models/system.modal.design';
import { CreateTodoForm } from '../../../features/todo/components/create-todo-form/create-todo-form';
// import {TodoCardGrid} from '../todo-card-grid/todo-card-grid';
import { IconBtn } from '../icon-btn/icon-btn';
import {MccConfirm} from '../modal-child-components/mcc-confirm/mcc-confirm';
import { TooltipDirective } from '../../directives/tooltip.directives';
import { StringDefaults } from '../../../core/models/system.string.defaults';

@Component({
  selector: 'app-todo-card',
  imports: [RouterLink, IconBtn, TooltipDirective],
  templateUrl: './todo-card.html',
  styleUrl: './todo-card.css',
})
export class TodoCard {
  // private readonly parentGridContext = inject(TodoCardGrid, { host: true });
  private readonly elementRef = inject(ElementRef);
  private readonly todoService = inject(TodoService);
  private readonly modalService = inject(ModalService);
  private readonly snackbarService = inject(SnackbarService);
  public todoTaskItem = input.required<ToDoTaskDto>();
  public isPopupHidden = signal<boolean>(true);

  constructor() {}

  public toggleContextPopup(event: MouseEvent): void {
    event.stopPropagation();
    this.isPopupHidden.set(!this.isPopupHidden());
  }

  @HostListener('document:click', ['$event'])
  public onGlobalClick(event: MouseEvent): void {
    if (this.isPopupHidden()) return;
    const clickedElement = event.target as HTMLElement;
    const isClickedInsideCard = this.elementRef.nativeElement.contains(clickedElement);
    if (!isClickedInsideCard) {
      this.isPopupHidden.set(true);
    }
  }

  public HandleComplete() {
    if (this.todoTaskItem().completedPomodoros > 0) {
    }
    this.isPopupHidden.set(true);
  }
  public HandleEdit(): void {
    this.isPopupHidden.set(true);
    const todoTask = this.todoTaskItem();
    const modalOptions: ModalOptions = {
      title: 'Update Task',
      closeOnOverlayClick: false,
      maxWidth: 'md',
    };
    const payload: IPayloadContainer<ToDoTaskDto> = { payload: todoTask };
    const dialog = this.modalService.show(CreateTodoForm, modalOptions, payload);
    dialog.onResult.then((updatedTask: UpdateToDoTaskDetailsCommand) => {
      this.todoService.UpdateToDoTask(updatedTask).subscribe({
        next: (response) => {
          if (response.isSuccess) {
            this.snackbarService.showSuccess('Task updated successfully!');
          } else {
            this.snackbarService.showWarning('Failed to updated task');
          }
        },
        error: (err) => {
            this.snackbarService.showError(`${StringDefaults.UnknownInfraError}: ${err}`);

        }
      });
    });
  }
  public HandleDelete(): void {
    this.isPopupHidden.set(true);
  }
  public HandlePriorityToggle(): void {
    this.todoService.ToggleToDoTaskPriority(this.todoTaskItem().id).subscribe({
      next: (response) => {
        if (response.isSuccess)
          this.snackbarService.showSuccess("Task's priority has been toggled successfully");
        else {
          this.snackbarService.showWarning("Failed to toggle this task's priority.");
        }
      },
      error: (err) => {
        this.snackbarService.showError(`${StringDefaults.UnknownInfraError}: ${err}`);
      }
    });
  }

  public HandleAbandon(): void{
    const modalOpts: ModalOptions = {
      title: "Abandon task?",
      closeOnOverlayClick: false,
      maxWidth: "sm"
    }
    const mccPayload: IPayloadContainer<string> ={
      payload: "Are you sure you want to abandon this task?"
    }
    const dialog = this.modalService.show(MccConfirm, modalOpts, mccPayload);
    dialog.onResult.then((response)=>{
      if(response){
        this.todoService.AbandonToDoTask(this.todoTaskItem().id).subscribe({
          next: (response) => {
            if (response.isSuccess) {
              this.snackbarService.showInfo('Task has been abandoned.');
            } else {
              this.snackbarService.showError(
                `Failed to abandon task: ${response.errors?.join(', ')}`,
              );
            }
          },
          error: (err) => {
            this.snackbarService.showError(`${StringDefaults.UnknownInfraError}: ${err}`);
          }
        });
      }
      else{
        this.snackbarService.showSuccess("Good on you for not abandoning a task!")
      }
    });
  }

  protected readonly GoogleIcons = GoogleIcons;
  protected readonly Math = Math;
}
