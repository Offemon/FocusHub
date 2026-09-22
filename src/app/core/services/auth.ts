import { signal, computed, Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { ApiFailureResponse, ApiResponse } from '../models/ApiResponse';
import { AuthResponse } from '../../features/login/login';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ParseProblemDetails } from '../utils/parser.util';
import { UserSession } from '../models/auth.model';

export interface LoginCommand {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly storageKey: string = 'focushub_session';
  private readonly http = inject(HttpClient);
  private readonly sessionState = signal<UserSession | null>(null);
  public currentUserId = computed(() => this.sessionState()?.userId ?? '');
  public isAuthenticated = computed(() => this.sessionState() !== null);

  constructor() {
    this.hydrateSessionFromCache();
  }

  private hydrateSessionFromCache(): void {
    const cachedData: string | null = localStorage.getItem(this.storageKey);
    if (!cachedData) return;
    try {
      const parsedData = JSON.parse(cachedData) as UserSession;

      if (this.isTokenExpired(parsedData.token)) {
        console.warn('Cached JW bearer token has expired. Forcing system logout.');
        this.Logout();
        return;
      }
      this.sessionState.set(parsedData);
    } catch (error) {
      console.error('State hydration corrupted. Purging cached session.', error);
    }
  }

  private isTokenExpired(token: string): boolean {
    if (!token) return true;
    try {
      const parts: string[] = token.split('.');
      if (parts.length !== 3) return true;
      const [, rawPayload] = parts;
      const decodedPayload = atob(rawPayload ?? '');
      const claims = JSON.parse(decodedPayload) as { exp: number };
      if (!claims.exp) return true;
      const currentUnixTimestamp = Math.floor(Date.now() / 1000);
      return currentUnixTimestamp >= claims.exp;
    } catch (e) {
      console.error('Failed to parse token payload constraints', e);
      return true;
    }
  }
  public CacheSession(session: UserSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.sessionState.set(session);
  }
  public LogIn(
    formPayload: LoginCommand
  ): Observable<ApiResponse<AuthResponse> | ApiFailureResponse> {
    return this.http.post<AuthResponse>('/auth/login', formPayload).pipe(
      map((response): ApiResponse<AuthResponse> => {
        return {
          isSuccess: true,
          payload: response,
        };
      }),
      catchError((error: HttpErrorResponse): Observable<ApiFailureResponse> => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public Register(registerUserCommand: LoginCommand): Observable<ApiResponse<string>>{
    return this.http.post<string>('/auth/register', registerUserCommand).pipe(
      map((response):ApiResponse<string> => {
        return {
          isSuccess: true,
          payload: response
        };
      }),
      catchError((error) => {
        return of(ParseProblemDetails(error));
      }),
    );
  }
  public Logout(): void {
    localStorage.removeItem(this.storageKey);
    this.sessionState.set(null);
  }

  public GetToken(): string | null {
    const token = this.sessionState()?.token ?? null;
    if (token && this.isTokenExpired(token)) {
      this.Logout();
      return null;
    }
    return token;
  }
}
