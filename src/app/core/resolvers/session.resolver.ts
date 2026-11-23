import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { ApiResponse, PagedResult } from '../models/ApiResponse';
import { SessionDto } from '../models/session.model';

export const taskSessionResolver: ResolveFn<ApiResponse<PagedResult<SessionDto>>> = (route, _state) => {
  const sessionService = inject(SessionService);
  const taskId = route.paramMap.get('id');
  if(taskId)
    return sessionService.resolveTaskSessions(taskId, 10, 1);
  else{
    throw new Error("Error: Task Id missing from the route snapshot.");
  }
};
export const allSessionResolver: ResolveFn<ApiResponse<PagedResult<SessionDto>>> = (_route, _state) => {
  const sessionService = inject(SessionService);
  return sessionService.resolveAllSessions( 10, 1);
};
