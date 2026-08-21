import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { todoResolver } from './core/resolvers/todo.resolver';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login').then((m) => m.Login),
  },
  {
    path: '',
    loadComponent: () => import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    canActivate: [authGuard],
    children:[
      {
        path:'pomodoro',
        loadComponent: () => import('./features/pomodoro/pomodoro').then((m) => m.Pomodoro)
      },
      {
        path: 'todos',
        loadComponent: () => import('./features/todo/todo').then((m) => m.Todo),
        resolve: {cacheHydrated: todoResolver}
      },
      {
        path: 'todos/:id',
        loadComponent: () => import('./features/todo/components/todo-details/todo-details').then((m) => m.TodoDetails),
        resolve: {cacheHydrated: todoResolver}
      },
      {
        path: 'pomodoro/sessions',
        loadComponent: () => import('./features/pomodoro/components/sessions/sessions').then((m) => m.Sessions)
      }
    ]
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register').then((m) => m.Register),
  },
  {
    path: '**',
    redirectTo: 'login',
  }
];
