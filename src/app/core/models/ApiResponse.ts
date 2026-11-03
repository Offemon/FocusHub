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

export interface PagedResult<T> {
  items : T[];
  pageNumber: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}


