import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { SessionDto } from '../models/session.model';
import { ApiResponse } from '../models/ApiResponse';

@Service()
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly sessionsListState = signal<SessionDto>

  public fetchTaskSessions(taskid: string, onResult: (response: ApiResponse) => void):void{

  }
}
