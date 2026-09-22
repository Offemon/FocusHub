import { Component, inject } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { TodoCard } from '../../shared/components/todo-card/todo-card';
import { SessionPlayer } from '../../shared/components/session-player/session-player';
import { TodoCardGrid } from '../../shared/components/todo-card-grid/todo-card-grid';


@Component({
  selector: 'app-pomodoro',
  imports: [TodoCard, SessionPlayer, TodoCardGrid],
  templateUrl: './pomodoro.html',
  styleUrl: './pomodoro.css',
})
export class Pomodoro {

  protected readonly todoService = inject(TodoService);
}
