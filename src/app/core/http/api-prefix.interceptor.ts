import {HttpInterceptorFn} from '@angular/common/http';
import { environment } from '../../../environment/environment.development';

export const apiPrefixInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.startsWith('http://') || req.url.startsWith('https://')) {
    return next(req);
  }
  const clonedRequest = req.clone({
    url: `${environment.apiUrl}${req.url}`,
  });
  return next(clonedRequest);
}
