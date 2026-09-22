// export interface ApiResponse<T = void>{
//   isSuccess: boolean;
//   payload?: T;
//   errors?: string[]
// }

export interface ApiSuccessResponse<T>{
  isSuccess: true;
  payload?: T;
}
export interface ApiFailureResponse{
  isSuccess:false;
  errors?: string[]
}
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiFailureResponse;




