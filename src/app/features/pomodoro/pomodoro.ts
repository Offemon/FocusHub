import { Component, inject } from '@angular/core';
import { TodoService } from '../../core/services/todo.service';
import { TodoCard } from '../../shared/components/todo-card/todo-card';

@Component({
  selector: 'app-pomodoro',
  imports: [TodoCard],
  templateUrl: './pomodoro.html',
  styleUrl: './pomodoro.css',
})
export class Pomodoro {
  protected readonly todoService = inject(TodoService);
}
