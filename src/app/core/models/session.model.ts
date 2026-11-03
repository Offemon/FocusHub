export interface LogPomodoroSessionCommand {
  ToDoTaskId: string;
  DurationMinutes: number;
}

export interface SessionDto{
  id: string;
  taskId: string | null;
  duration: number;
  completedAt: string;
}
