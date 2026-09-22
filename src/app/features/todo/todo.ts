import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal';
import { CreateTodoForm } from './components/create-todo-form/create-todo-form';
import { CreateToDoTaskCommand } from '../../core/models/todo.model';
import { TodoService } from '../../core/services/todo.service';
import { TodoCard } from '../../shared/components/todo-card/todo-card';
import { TodoCardGrid } from '../../shared/components/todo-card-grid/todo-card-grid';
import { SnackbarService } from '../../core/services/snackbar';
import { StringDefaults } from '../../core/models/system.string.defaults';


@Component({
  selector: 'app-todo',
  imports: [TodoCard, TodoCardGrid],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {
  private readonly modalService = inject(ModalService);
  private readonly snackbarService = inject(SnackbarService);
  protected readonly todoService = inject(TodoService);

  public openTaskCreationDialog(): void {
    const dialog = this.modalService.show(CreateTodoForm, {
      title: 'Create a new To-do',
      maxWidth: 'md',
      closeOnOverlayClick: true,
    });
    dialog.onResult.then((newTaskPayload: CreateToDoTaskCommand | null | undefined) => {
      if (newTaskPayload && typeof newTaskPayload === 'object') {
        this.todoService.CreateToDoTask(newTaskPayload).subscribe({
          next: (response) => {
            if(response.isSuccess)
              this.snackbarService.showSuccess("Task successfully created");
            else
              this.snackbarService.showWarning(`Failed to create task: ${response.errors?.join(',\n')}`)
          },
          error: (err) => {
            this.snackbarService.showError(`${StringDefaults.UnknownInfraError}: ${err}`);
          }
        });
      }
    });
  }
}
