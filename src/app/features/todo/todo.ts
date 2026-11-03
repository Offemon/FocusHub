import { Component, inject, Signal } from '@angular/core';
import { ModalService } from '../../core/services/modal';
import { CreateTodoForm } from './components/create-todo-form/create-todo-form';
import { CreateToDoTaskCommand, ToDoTaskDto } from '../../core/models/todo.model';
import { TodoService } from '../../core/services/todo.service';
import { TodoCardGrid } from '../../shared/components/todo-card-grid/todo-card-grid';
import { SnackbarService } from '../../core/services/snackbar';
import { StringDefaults } from '../../core/models/system.string.defaults';
import { ApiResponse, PagedResult } from '../../core/models/ApiResponse';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import { Banner } from '../../shared/components/banner/banner';
import { Severity } from '../../core/models/Severity';
import { Variant } from '../../core/models/Variant';


@Component({
  selector: 'app-todo',
  imports: [TodoCardGrid, Banner],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {
  private readonly modalService = inject(ModalService);
  private readonly route = inject(ActivatedRoute);
  private readonly snackbarService = inject(SnackbarService);
  protected readonly todoService = inject(TodoService);
  protected readonly todoCardGridPageSize: number = 32;

  private initialTasks: PagedResult<ToDoTaskDto> = {
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  protected readonly pagedTodoTasks: Signal<ApiResponse<PagedResult<ToDoTaskDto> | never>> =
    toSignal(
      this.route.data.pipe(
        map((routeData) => {
          if (routeData['allTodoData']) return routeData['allTodoData'];
          else
            return {
              isSuccess: false,
              error: ['Routing dataset reference lost or offline.'],
            };
        }),
      ),
      {
        initialValue: {
          isSuccess: true,
          payload: this.initialTasks,
        },
      },
    );
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
            if (response.isSuccess) this.snackbarService.showSuccess('Task successfully created');
            else
              this.snackbarService.showWarning(
                `Failed to create task: ${response.errors?.join(',\n')}`,
              );
          },
          error: (err) => {
            this.snackbarService.showError(`${StringDefaults.UnknownInfraError}: ${err}`);
          },
        });
      }
    });
  }

  protected readonly Severity = Severity;
  protected readonly Variant = Variant;
}
