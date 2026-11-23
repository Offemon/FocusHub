import { Component, inject } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { SessionPlayer } from '../../shared/components/session-player/session-player';
import { TodoCardGrid } from '../../shared/components/todo-card-grid/todo-card-grid';
import { toSignal } from '@angular/core/rxjs-interop';
import { getResolvedTasksStream } from '../../core/utils/route-data';
import { SessionService } from '../../core/services/session.service';
import { ApiResponse, PagedResult } from '../../core/models/ApiResponse';
import { ToDoTaskDto } from '../../core/models/todo.model';
import { ActivatedRoute } from '@angular/router';
import { ROUTE_DATA_KEYS } from '../../core/constants/route.constants';


@Component({
  selector: 'app-pomodoro',
  imports: [SessionPlayer, TodoCardGrid],
  templateUrl: './pomodoro.html',
  styleUrl: './pomodoro.css',
})
export class Pomodoro {
  protected readonly route = inject(ActivatedRoute);
  protected readonly sessionService = inject(SessionService);
  protected readonly todoService = inject(TodoService);
  protected readonly resolvedTasks = toSignal(
    getResolvedTasksStream(
      this.route,
      ROUTE_DATA_KEYS.LITE_TODOS,
      this.todoService,
      this.todoService.initialTasks
    ),
    {
      initialValue: {
        isSuccess: true,
        payload: this.todoService.initialTasks
      } as ApiResponse<PagedResult<ToDoTaskDto>>
    }
  );
}
