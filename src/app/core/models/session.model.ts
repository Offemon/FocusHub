export interface LogPomodoroSessionCommand {
  ToDoTaskId: string;
  DurationMinutes: number;
}

export interface SessionDto{
  taskId: string | null;
  durationMinutes: number;
  completedAt: string;
}
