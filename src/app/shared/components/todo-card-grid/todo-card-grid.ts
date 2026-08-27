import { Component, contentChildren, input } from '@angular/core';
import { TodoCard } from '../todo-card/todo-card';

@Component({
  selector: 'app-todo-card-grid',
  imports: [],
  templateUrl: './todo-card-grid.html',
  styleUrl: './todo-card-grid.css',
})
export class TodoCardGrid {
  public isCompact = input<boolean>(false);
  public readonly validChildComponent = contentChildren(TodoCard);

  constructor() {
  }
}
