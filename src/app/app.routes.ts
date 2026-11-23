import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { liteTodoResolver, todoResolver } from './core/resolvers/todo.resolver';
import { PomodoroNavigationGuard } from './core/guards/pomodoro-navigation.guard';
import { allSessionResolver, taskSessionResolver } from './core/resolvers/session.resolver';
import { ROUTE_DATA_KEYS } from './core/constants/route.constants';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    children: [
      {
        path: 'pomodoro',
        loadComponent: () => import('./features/pomodoro/pomodoro').then((m) => m.Pomodoro),
        resolve: { [ROUTE_DATA_KEYS.PAGED_TODOS]: todoResolver },
      },
      {
        path: 'todos',
        loadComponent: () => import('./features/todo/todo').then((m) => m.Todo),
        resolve: { [ROUTE_DATA_KEYS.PAGED_TODOS]: todoResolver },
      },
      {
        path: 'todos/:id',
        loadComponent: () =>
          import('./features/todo/components/todo-details/todo-details').then((m) => m.TodoDetails),
        resolve: {
          [ROUTE_DATA_KEYS.LITE_TODOS]: liteTodoResolver,
          [ROUTE_DATA_KEYS.PAGED_TASK_SESSIONS]: taskSessionResolver,
        },
        canDeactivate: [PomodoroNavigationGuard],
      },
      {
        path: 'pomodoro/sessions',
        loadComponent: () =>
          import('./features/pomodoro/components/sessions/sessions').then((m) => m.Sessions),
        resolve: {[ROUTE_DATA_KEYS.PAGED_SESSIONS]: allSessionResolver}
      },
    ],
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];
