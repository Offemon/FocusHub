import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth';
import { LogPomodoroSessionCommand, SessionDto } from '../models/session.model';
import { ApiResponse } from '../models/ApiResponse';

@Service()
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly sessionsListState = signal<SessionDto[]>([]);

  public logSession(command: LogPomodoroSessionCommand, onResult: (response: ApiResponse<string>) => void): void{
  this.http.post<string>('/sessions/log-session', command).subscribe({
    next: (newSessionGuidString) => {
      onResult({
        isSuccess: true,
        payload: newSessionGuidString
      });
    },
    error: (err) => {
      const serverErrors = err.error?.errors || [err.message || "Unknown infrastructure error."];
      onResult({
        isSuccess: false,
        errors: Array.isArray(serverErrors) ? serverErrors : [String(serverErrors)]
      });
    }
  });
  }
  public fetchTaskSessions(taskid: string, onResult: (response: ApiResponse<SessionDto[]>) => void):void{
    this.http.get<SessionDto[]>(`/sessions/${taskid}`).subscribe({
      next: (sessionDtos) => {
        onResult({
          isSuccess: true,
          payload: sessionDtos
        });
      },
      error: (err) => {
        const serverErrors = err.error?.errors || [err.message || "Unknown infrastructure error."];
        onResult({
          isSuccess: false,
          errors: Array.isArray(serverErrors) ? serverErrors : [String(serverErrors)]
        });
      }
    });
  }
  public fetchAllSessions(onResult: (response: ApiResponse<SessionDto[]>) => void): void {
    this.http.get<SessionDto[]>('/sessions').subscribe({
      next: (sessionDtos) => {
        this.sessionsListState.set(sessionDtos);
        onResult({
          isSuccess: true,
          payload: sessionDtos
        })
      },
      error: (err) => {
        const serverErrors = err.error?.errors || [err.Message || "Unknown infrastructure error."];
        onResult({
          isSuccess: false,
          errors: Array.isArray(serverErrors) ? serverErrors : [String(serverErrors)]
        });
      }
    });
  }
  public fetchQuickSessions(onResult: (response: ApiResponse<SessionDto[]>) => void): void{
    this.http.get<SessionDto[]>('/sessions/quick').subscribe({
      next: (sessionDtos) => {
        onResult({
          isSuccess: true,
          payload: sessionDtos
        });
      },
      error: (err) => {
        const serverErrors = err.error?.error || [err.Messages || "Unknown infrastructure error."];
        onResult({
          isSuccess: false,
          errors: Array.isArray(serverErrors) ? serverErrors : [String(serverErrors)]
        });
      }
    });
  }
}
