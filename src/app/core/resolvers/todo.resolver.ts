import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TodoService } from '../services/todo.service';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResult } from '../models/ApiResponse';
import { ToDoTaskDto } from '../models/todo.model';

export const todoResolver: ResolveFn<ApiResponse<PagedResult<ToDoTaskDto>>> = (_route, _state) => {
  const todoService = inject(TodoService);
  return todoService.resolveTasks(1, 10);
};

export const liteTodoResolver: ResolveFn<ApiResponse<PagedResult<ToDoTaskDto>>> = (_route, _state): Observable<ApiResponse<PagedResult<ToDoTaskDto>>> => {
  const todoService = inject(TodoService);
  return todoService.resolveActiveTasks(1, 8);
};
