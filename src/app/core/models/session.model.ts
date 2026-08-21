export interface LogPomodoroSessionCommand {
  taskId: string;
  durationMinutes: number;
}

export interface SessionDto{
  taskId: string | null;
  durationMinutes: number;
  completedAt: string;
}
