import { HttpErrorResponse } from '@angular/common/http';
import { ApiFailureResponse } from '../models/ApiResponse';
import { StringDefaults } from '../models/system.string.defaults';

export function ParseProblemDetails(error: HttpErrorResponse): ApiFailureResponse{
  let parsedValidationErrors: string[] = [];
  if(error.error && typeof error.error.errors === 'object'){
    const problemDetailsErrors = error.error.errors;
    parsedValidationErrors = Object.values(problemDetailsErrors).flat() as string[];
  }
  else if(error.error?.title){
    parsedValidationErrors = [error.error.title];
  }
  else{
    parsedValidationErrors = [error.message || StringDefaults.UnknownInfraError]
  }
  return{
    isSuccess: false,
    errors: parsedValidationErrors
  };
}
