import { computed, inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CreateToDoTaskCommand,
  DeleteToDoTaskCommand,
  ToDoTaskDto,
  UpdateToDoTaskDetailsCommand,
} from '../models/todo.model';
import { Observable, tap } from 'rxjs';
import { AuthService } from './auth';
import { ApiResponse } from '../models/ApiResponse';

@Service()
export class TodoService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly todoListState = signal<ToDoTaskDto[]>([]);

  public allToDos = computed(() => this.todoListState());
  public pendingToDos = computed(() => this.todoListState().filter((t) => !t.isCompleted));
  public completedToDos = computed(() => this.todoListState().filter((t) => t.isCompleted));
  public totalPendingCount = computed(() => this.pendingToDos().length);

  public fetchAllToDoTasks(): void {
    this.http.get<ToDoTaskDto[]>('/tasks/active').subscribe({
      next: (toDoTasks) => {
        this.todoListState.set(toDoTasks);
      },
      error: (err) => console.error('failed to stream PostgreSQL task registres:', err),
    });
  }

  public createToDoTask(request: CreateToDoTaskCommand): void {
    this.http.post<ToDoTaskDto>('/tasks', request).subscribe({
      next: (toDoTask) => {
        this.todoListState.update((currentToDoCollection) => [...currentToDoCollection, toDoTask]);
      },
      error: (err) => {
        console.error('PostgreSQL task transaction rejected', err);
      },
    });
  }
  public deleteToDoTask(taskId: string | null, onResult: (response: ApiResponse) => void): void {
    if(!taskId) return;
    this.http.delete<void>(`/tasks/${taskId}`).subscribe({
      next: () => {
        this.todoListState.update((currentCache) =>
          currentCache.filter((task) => task.id !== taskId),
        );
        onResult({isSuccess: true});
      },
      error: (error) => {
        const serverErrors = error.error?.errors || [error.message || "Unknown infrastructure error."];
        onResult({
          isSuccess: false,
          errors: Array.isArray(serverErrors) ? serverErrors: [String(serverErrors)]
        });
      },
    });
  }
  public updateToDoTask(request: UpdateToDoTaskDetailsCommand | null, onResult: (response: ApiResponse) => void): void{
    if (!request) return;
    this.http.put<void>(`/tasks/${request.taskId}`, request).subscribe({
      next: () => {
        this.todoListState.update((todoList) =>
          todoList.map((task) => {
            if(task.id === request.taskId){
              return {
                ...task,
                title: request.title,
                description: request.description,
                estimatedPomodoros: request.estimatedPomodoros,
                dueDate: request.dueDate,
              };
            }
            return task;
          })
        );
        onResult({isSuccess: true});
      },
      error: (err) => {
        const serverErrors = err.error?.errors || [err.message || "Unknown infrastructure error."]
        onResult({
          isSuccess: false,
          errors: Array.isArray(serverErrors) ? serverErrors : [String(serverErrors)]
        })
      },
    });
  }
  public fetchTaskById(taskId: string): Observable<ToDoTaskDto> {
    return this.http.get<ToDoTaskDto>(`/tasks/${taskId}`);
  }
  public fetchAllTasksStream(): Observable<ToDoTaskDto[]> {
    return this.http.get<ToDoTaskDto[]>('/tasks/active').pipe(
      tap((tasksFromDb) => {
        this.todoListState.set(tasksFromDb);
      }),
    );
  }
}
