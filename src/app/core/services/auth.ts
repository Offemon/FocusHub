import { Service, signal, computed } from '@angular/core';


export interface UserSession {
  token: string;
  userId: string;
  email: string;
  authTimestamp: number;
}
@Service()
export class AuthService {
  private readonly storageKey: string = 'focushub_session';

  private readonly sessionState = signal<UserSession | null>(null);
  public currentUserEmail = computed(() => this.sessionState()?.email ?? '');
  public currentUserId = computed(() => this.sessionState()?.userId ?? '');
  public isAuthenticated = computed(() => this.sessionState() !== null);

  constructor(){
    this.hydrateSessionFromCache();
  }

  private hydrateSessionFromCache(): void {
    const cachedData: string | null = localStorage.getItem(this.storageKey);
    if(!cachedData) return;
    try{
      const parsedData = JSON.parse(cachedData) as UserSession;

      if (this.isTokenExpired(parsedData.token)){
        console.warn('Cached JW bearer token has expired. Forcing system logout.');
        this.logout();
        return;
      }
      this.sessionState.set(parsedData);
    }
    catch(error){
      console.error('State hydration corrupted. Purging cached session.',error);
    }
  }

  private isTokenExpired(token: string): boolean {
    if(!token) return true;
    try{
      const parts: string[] = token.split('.');
      if (parts.length !== 3) return true;
      const decodedPayload = atob(parts[1]);
      const claims = JSON.parse(decodedPayload) as {exp: number};
      if (!claims.exp) return true;
      const currentUnixTimestamp = Math.floor(Date.now() / 1000);
      return currentUnixTimestamp >= claims.exp;
    }
    catch(e){
      console.error('Failed to parse token payload constraints',e);
      return true;
    }
  }
  public cacheSession(session: UserSession): void {
    localStorage.setItem(this.storageKey, JSON.stringify(session));
    this.sessionState.set(session);
  }

  public logout(): void{
    localStorage.removeItem(this.storageKey)
    this.sessionState.set(null);
  }

  public getToken(): string | null{
    const token = this.sessionState()?.token ?? null;
    if( token && this.isTokenExpired(token)){
      this.logout();
      return null;
    }
    return token;
  }
}
