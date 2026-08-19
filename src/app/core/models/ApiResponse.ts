export interface ApiResponse<T = void>{
  isSuccess: boolean;
  payload?: T;
  errors?: string[]
}
