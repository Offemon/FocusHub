export interface LogPomodoroSessionCommand {
  userId: string;
  taskId: string;
  durationMinutes: number;
}

export interface SessionDto{
  taskId: string;
  durationMinutes: number;
  completedAt: string;
}
