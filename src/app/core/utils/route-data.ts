import { map, Observable, tap } from 'rxjs';
import {ApiResponse, PagedResult} from '../models/ApiResponse';
import {ToDoTaskDto} from '../models/todo.model';
import {ActivatedRoute} from '@angular/router';
import {TodoService} from '../services/todo.service';
import { RouteDataKey } from '../constants/route.constants';
import {SessionDto} from '../models/session.model';

export function getResolvedTasksStream(
  route: ActivatedRoute,
  dataKey: RouteDataKey,
  todoService: TodoService,
  fallbackPayload: PagedResult<ToDoTaskDto>
): Observable<ApiResponse<PagedResult<ToDoTaskDto>>>{
  return route.data.pipe(
    map((routeData) => {
      return routeData[dataKey] ?? {isSuccess: true, payload: fallbackPayload};
    }),
    tap((response) => {
      if(response.isSuccess && response.payload){
        todoService.todoListState.set(response.payload.items);
        todoService.hasNextPage.set(response.payload.hasNextPage);
        todoService.pageNumber.set(response.payload.pageNumber);
      }
    })
  );
}

export function getResolvedSessionsStream(
  route: ActivatedRoute,
  dataKey: RouteDataKey,
  fallbackPayload: PagedResult<SessionDto>,
): Observable<ApiResponse<PagedResult<SessionDto>>> {
  return route.data.pipe(
    map((routeData) => {
      return routeData[dataKey] ?? { isSuccess: true, payload: fallbackPayload };
    })
  );
}
