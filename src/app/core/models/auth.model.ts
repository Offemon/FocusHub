export interface UserSession {
  token: string;
  userId: string;
  email: string;
  authTimestamp: number;
}

export interface AuthCommand {
  email: string;
  password: string;
}
