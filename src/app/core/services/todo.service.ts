import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  CompleteToDoTaskWithSessionCommand,
  CreateToDoTaskCommand,
  TaskState,
  ToDoTaskDto,
  UpdateToDoTaskDetailsCommand,
} from '../models/todo.model';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { ApiResponse } from '../models/ApiResponse';
import {ParseProblemDetails} from '../utils/parser.util';

@Injectable({
  providedIn: 'root',
})
export class TodoService {
  private readonly http = inject(HttpClient);
  // private readonly authService = inject(AuthService);
  private readonly todoListState = signal<ToDoTaskDto[]>([]);

  public allToDos = computed(() => this.todoListState());
  public pendingToDos = computed(() =>
    this.todoListState().filter((t) => t.currentState === TaskState.Active),
  );
  public completedToDos = computed(() =>
    this.todoListState().filter((t) => t.currentState === TaskState.Completed),
  );
  public missedToDos = computed(() => this.todoListState().filter((t) => t.currentState === TaskState.Missed));
  public abandonedToDos = computed(() => this.todoListState().filter(t => t.currentState === TaskState.Abandoned));
  public totalPendingCount = computed(() => this.pendingToDos().length);

  public PendingToDosExcept(taskId: string): ToDoTaskDto[] {
    return this.allToDos()
      .filter((t) => t.currentState === TaskState.Active && t.id !== taskId)
      .sort((a, b) => {
        const dateA = a.dueDate ?? '9999-12-31';
        const dateB = b.dueDate ?? '9999-12-31';
        return dateA.localeCompare(dateB);
      });
  }
  public CreateToDoTask(request: CreateToDoTaskCommand): Observable<ApiResponse<ToDoTaskDto>> {
    return this.http.post<string>('/tasks', request).pipe(
      map((response: string): ApiResponse<ToDoTaskDto> => {
        const createdTask: ToDoTaskDto = {
          id: response,
          title: request.title,
          description: request.description,
          currentState: TaskState.Active,
          createdAt: new Date().toISOString(),
          estimatedPomodoros: request.estimatedPomodoros,
          completedPomodoros: 0,
          dueDate: request.dueDate,
          updatedAt: null,
          isPriority: request.isPriority,
          energyLevel: request.energyLevel,
          modifyCount: 0,
        };
        this.todoListState.update((todoList) => [createdTask, ...todoList]);
        return {
          isSuccess: true,
          payload: createdTask,
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public IncrementSessionCount(taskId: string): void {
    this.todoListState.update((todoList) =>
      todoList.map((task) => {
        if (task.id === taskId) {
          return {
            ...task,
            completedPomodoros: task.completedPomodoros + 1,
            updatedAt: new Date().toISOString(),
          };
        }
        return task;
      }),
    );
  }
  public DeleteToDoTask(taskId: string): Observable<ApiResponse<void>> {
    return this.http.delete<void>(`/tasks/${taskId}`).pipe(
      map((): ApiResponse<void> => {
        this.todoListState.update((todoList) => todoList.filter((task) => task.id !== taskId));
        return { isSuccess: true };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<void>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public UpdateToDoTask(request: UpdateToDoTaskDetailsCommand): Observable<ApiResponse<void>> {
    return this.http.put<void>(`/tasks/${request.taskId}`, request).pipe(
      map((): ApiResponse<void> => {
        this.todoListState.update((todoList) =>
          todoList.map((todo) => {
            if (todo.id === request.taskId) {
              return {
                ...todo,
                title: request.title,
                description: request.description,
                estimatedPomodoros: request.estimatedPomodoros,
                dueDate: request.dueDate,
                isPriority: request.isPriority,
                energyLevel: request.energyLevel,
                updatedAt: new Date().toISOString(),
                modifyCount: todo.modifyCount + 1,
              };
            }
            return todo;
          }),
        );
        return { isSuccess: true };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<void>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }

  public localUpdateToDoTask(todo: ToDoTaskDto): void{
    this.todoListState.update(todoList =>
      todoList.map((task) => {
        if(task.id === todo.id){
          return {
            ...todo
          }
        }
        return task;
      })
    );
  }
  public TagToDoTaskComplete(taskId: string): Observable<ApiResponse<void>> {
    return this.http.put<void>(`/tasks/${taskId}/complete`, {}).pipe(
      map((): ApiResponse<void> => {
        this.todoListState.update((todoList) =>
          todoList.map((todo) => {
            if (todo.id === taskId) {
              return {
                ...todo,
                isCompleted: true,
              };
            }
            return todo;
          }),
        );
        return { isSuccess: true };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<void>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public TagToDoTaskWithSessionComplete(
    taskId: string,
    sessionDurationMinutes: number,
  ): Observable<ApiResponse<void>> {
    const command: CompleteToDoTaskWithSessionCommand = { durationMinutes: sessionDurationMinutes };
    return this.http.put<void>(`/tasks/${taskId}/complete-with-session`, command).pipe(
      map((): ApiResponse<void> => {
        this.todoListState.update((todoList) =>
          todoList.map((todo) => {
            if (todo.id === taskId) {
              return {
                ...todo,
                isCompleted: true,
                completedPomodoros: todo.completedPomodoros + 1,
              };
            }
            return todo;
          }),
        );
        return { isSuccess: true };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<void>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public ToggleToDoTaskPriority(taskId: string): Observable<ApiResponse<void>> {
    return this.http.put<void>(`/tasks/${taskId}/toggle-priority`, {}).pipe(
      map((): ApiResponse<void> => {
        this.todoListState.update((todoList) =>
          todoList.map((todo) => {
            if (todo.id === taskId) {
              return {
                ...todo,
                isPriority: !todo.isPriority,
              };
            }
            return todo;
          }),
        );
        return { isSuccess: true };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<void>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public AbandonToDoTask(taskId: string): Observable<ApiResponse<void>> {
    return this.http.put<void>(`/tasks/${taskId}/abandon-task`, {}).pipe(
      map((): ApiResponse<void> => {
        this.todoListState.update((todoList) =>
          todoList.map((todo) => {
            if (todo.id === taskId) {
              return {
                ...todo,
                isAbandoned: true,
              };
            }
            return todo;
          }),
        );
        return { isSuccess: true };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<void>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public fetchTaskById(taskId: string): Observable<ToDoTaskDto> {
    return this.http.get<ToDoTaskDto>(`/tasks/${taskId}`);
  }
  public FetchAllTasksStream(): Observable<ToDoTaskDto[]> {
    return this.http.get<ToDoTaskDto[]>('/tasks').pipe(
      tap((tasksFromDb) => {
        this.todoListState.set(tasksFromDb);
      }),
    );
  }
}
