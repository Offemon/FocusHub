import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { LogPomodoroSessionCommand, SessionDto } from '../models/session.model';
import { ApiResponse } from '../models/ApiResponse';
import {TodoService} from './todo.service';
import { catchError, map, Observable, of } from 'rxjs';
import { ParseProblemDetails } from '../utils/parser.util';

@Injectable({
  providedIn: "root"
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly todoService = inject(TodoService);

  public LogSession(command: LogPomodoroSessionCommand): Observable<ApiResponse<string>>{
    return this.http.post<string>('/sessions/log-session', command).pipe(
      map((response): ApiResponse<string> => {
        this.todoService.IncrementSessionCount(command.ToDoTaskId);
        return { isSuccess: true, payload: response };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public FetchTaskSessions(taskId: string): Observable<ApiResponse<SessionDto[]>> {
    return this.http.get<SessionDto[]>(`/sessions/${taskId}`).pipe(
      map((taskSessions): ApiResponse<SessionDto[]> =>{
        return {
          isSuccess: true,
          payload: taskSessions
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      })
    );
  }
  public FetchAllSessions(): Observable<ApiResponse<SessionDto[]>> {
    return this.http.get<SessionDto[]>('/sessions').pipe(
      map((sessions): ApiResponse<SessionDto[]> => {
        return {
          isSuccess: true,
          payload: sessions
        };
      }),
      catchError((error: HttpErrorResponse):Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      })
    );
  }
  public FetchQuickSessions(): Observable<ApiResponse<SessionDto[]>> {
    return this.http.get<SessionDto[]>('/sessions/quick').pipe(
      map((sessions): ApiResponse<SessionDto[]> => {
        return {
          isSuccess: true,
          payload: sessions
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      })
    );
  }
}
