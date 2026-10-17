import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { ApiFailureResponse } from '../models/ApiResponse';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error:HttpErrorResponse): Observable<any> => {
      const errorResponse: ApiFailureResponse = {
        isSuccess: false,
        errors: []
      };
      if (error.error && typeof error.error === 'object'){
        const problemDetails = error.error;
        if(problemDetails.errors && problemDetails.errors === 'object'){
          let extractedErrors: string[] =[];
          Object.entries(problemDetails.errors).forEach(([field, messages]) => {
            const formattedField = field
              .replace(/([A-Z])/g, '\$1')
              .replace(/^./, (str) => str.toUpperCase())
              .trim();
            if (Array.isArray(messages)) {
              // extractedErrors.push(...messages);
              messages.forEach((msg) => {
                extractedErrors.push(`[${formattedField}]: ${msg}`);
              });
            } else if (typeof messages === 'string') {
              extractedErrors.push(`[${formattedField}]: ${messages}`);
            }
          });
          errorResponse.errors = extractedErrors;
        }
        else if (problemDetails.detail){
          errorResponse.errors = [problemDetails.detail];
        }
        else if (problemDetails.title) {
          errorResponse.errors = [problemDetails.title];
        }
      }
      if (errorResponse.errors?.length === 0){
        errorResponse.errors = ['Network failure: Unable to contact server.'];
      }
      else{
        errorResponse.errors = [`Server exception encountered (HTTP Status Code ${error.status}`];
      }
      console.warn(`[RFC 9457 Intercepted]: Normalizing backend error profile.`);
      return of(errorResponse);
    })
  );
};
