import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { ApiResponse, PagedResult } from '../models/ApiResponse';
import { SessionDto } from '../models/session.model';

export const sessionResolver: ResolveFn<ApiResponse<PagedResult<SessionDto>>> = (route, _state) => {
  const sessionService = inject(SessionService);
  const taskId = route.paramMap.get('id');
  console.log(taskId);
  if(taskId)
    return sessionService.resolveTaskSessions(taskId, 10, 1);
  else{
    throw new Error("Error: Task Id missing from the route snapshot.");
  }
};
