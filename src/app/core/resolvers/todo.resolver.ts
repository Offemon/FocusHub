import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { TodoService } from '../services/todo.service';
import { map, of } from 'rxjs';

export const todoResolver: ResolveFn<boolean> = (_route, _state) => {
  const todoService = inject(TodoService);
  if(todoService.allToDos().length > 0)
    return of(true);
  return todoService.FetchAllTasksStream().pipe(
    map((tasksArray) => {
      return Array.isArray(tasksArray)
    })
  );
}
