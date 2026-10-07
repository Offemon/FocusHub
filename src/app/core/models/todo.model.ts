export interface ToDoTaskDto{
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  currentState: TaskStateType;
  estimatedPomodoros: number;
  completedPomodoros: number;
  dueDate: string | null;
  updatedAt: string | null;
  isPriority: boolean;
  energyLevel: TaskEnergyLevelType;
  modifyCount: number;
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

export const TaskState = {
  Active: 1,
  Abandoned: 2,
  Completed: 3,
  Missed: 4,
} as const;

export type TaskStateType = typeof TaskState[keyof typeof TaskState];
