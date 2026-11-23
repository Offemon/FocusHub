export const ROUTE_DATA_KEYS = {
  LITE_TODOS: 'liteTodoData',
  PAGED_TODOS: 'pagedTodoData',
  PAGED_TASK_SESSIONS: 'pagedTaskSessionsData',
  PAGED_SESSIONS: 'pagedSessionsData'
} as const;

export type RouteDataKey = typeof ROUTE_DATA_KEYS[keyof  typeof ROUTE_DATA_KEYS];
