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
  isAbandoned: boolean;
  isPriority: boolean;
  energyLevel: TaskEnergyLevelType;
}

export interface CreateToDoTaskCommand {
  userId: string;
  title: string;
  description: string | null;
  estimatedPomodoros: number;
  dueDate: string | null;
  isPriority: boolean;
  energyLevel: TaskEnergyLevelType;
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
  isPriority: boolean;
  energyLevel: TaskEnergyLevelType;
}

export interface CompleteToDoTaskWithSessionCommand {
  durationMinutes: number;
}

export const TaskEnergyLevel = {
  Low: 1,
  Medium: 2,
  High: 3,
} as const;

export type TaskEnergyLevelType = typeof TaskEnergyLevel[keyof typeof TaskEnergyLevel];
