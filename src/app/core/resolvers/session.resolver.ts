import { ResolveFn } from '@angular/router';
import { inject } from '@angular/core';
import { SessionService } from '../services/session.service';
import { ApiResponse } from '../models/ApiResponse';
import { SessionDto } from '../models/session.model';

export const sessionResolver: ResolveFn<ApiResponse<SessionDto[]>> = (route, _state) => {
  const sessionService = inject(SessionService);
  const taskId = route.paramMap.get('id');
  console.log(taskId);
  if(taskId)
    return sessionService.FetchTaskSessions(taskId);
  else{
    throw new Error("Error: Task Id missing from the route snapshot.");
  }
};
