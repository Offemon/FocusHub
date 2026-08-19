export interface ToDoTaskDto{
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
  createdAt: string;
  estimatedPomodoros: number;
  completedPomodoros: number;
  dueDate: string | null;
  updatedAt: string | null;
}

export interface CreateToDoTaskCommand{
  userId: string;
  title: string;
  description: string | null;
  estimatedPomodoros: number;
  dueDate: string | null;
}
export interface DeleteToDoTaskCommand{
  taskId: string;
  userId: string;
}
export interface UpdateToDoTaskDetailsCommand{
  taskId: string;
  userId: string;
  title: string;
  description: string | null;
  estimatedPomodoros: number;
  dueDate: string | null;
}
