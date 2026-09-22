export interface UserSession {
  token: string;
  userId: string;
  email: string;
  authTimestamp: number;
}
