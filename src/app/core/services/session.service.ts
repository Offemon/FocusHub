import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { LogPomodoroSessionCommand, SessionDto } from '../models/session.model';
import { ApiResponse, PagedResult } from '../models/ApiResponse';
import {TodoService} from './todo.service';
import { catchError, map, Observable, of } from 'rxjs';
import { ParseProblemDetails } from '../utils/parser.util';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private readonly http = inject(HttpClient);
  private readonly todoService = inject(TodoService);

  public initialTaskSessions: PagedResult<SessionDto> = {
    items: [],
    pageNumber: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  public LogSession(command: LogPomodoroSessionCommand): Observable<ApiResponse<string>> {
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
      map((taskSessions): ApiResponse<SessionDto[]> => {
        return {
          isSuccess: true,
          payload: taskSessions,
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public resolveTaskSessions(
    taskId: string,
    pageSize: number,
    pageNumber: number,
  ): Observable<ApiResponse<PagedResult<SessionDto>>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<SessionDto>>(`/sessions/${taskId}`, { params: params }).pipe(
      map((response): ApiResponse<PagedResult<SessionDto>> => {
        return {
          isSuccess: true,
          payload: response,
        };
      }),
    );
  }
  public resolveAllSessions(
    pageSize: number,
    pageNumber: number
  ): Observable<ApiResponse<PagedResult<SessionDto>>>{
    const params = new HttpParams()
      .set('pageNumber', pageNumber.toString())
      .set('pageSize', pageSize.toString());
    return this.http.get<PagedResult<SessionDto>>(`/sessions`, {params: params}).pipe(
      map((response) => {
        return {
          isSuccess: true,
          payload: response
        };
      })
    );
  }
  public FetchAllSessions(): Observable<ApiResponse<SessionDto[]>> {
    return this.http.get<SessionDto[]>('/sessions').pipe(
      map((sessions): ApiResponse<SessionDto[]> => {
        return {
          isSuccess: true,
          payload: sessions,
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public FetchQuickSessions(): Observable<ApiResponse<SessionDto[]>> {
    return this.http.get<SessionDto[]>('/sessions/quick').pipe(
      map((sessions): ApiResponse<SessionDto[]> => {
        return {
          isSuccess: true,
          payload: sessions,
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiResponse<never>> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
}
