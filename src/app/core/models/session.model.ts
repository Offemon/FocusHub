export interface LogPomodoroSessionCommand {
  ToDoTaskId: string;
  DurationMinutes: number;
}

export interface SessionDto{
  sessionId: string;
  taskId: string | null;
  duration: number;
  completedAt: string;
}
