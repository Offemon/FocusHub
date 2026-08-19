import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth';
import { inject } from '@angular/core';
import { environment } from '../../../environment/environment.development';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  const apiOrigin = environment.apiOrigin;
  const isTargetingApi = req.url.startsWith('/') || req.url.startsWith(apiOrigin);
  if(token && isTargetingApi){
    const securedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(securedRequest);
  }
  return next(req);
}
