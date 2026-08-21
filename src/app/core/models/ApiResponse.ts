// export interface ApiResponse<T = void>{
//   isSuccess: boolean;
//   payload?: T;
//   errors?: string[]
// }
export type ApiResponse<T = void> =
  { isSuccess: true; payload?: T } | { isSuccess: false; errors?: string[] };




