import { Component, inject } from '@angular/core';
import { ModalService } from '../../core/services/modal';
import { CreateTodoForm } from './components/create-todo-form/create-todo-form';
import { CreateToDoTaskCommand } from '../../core/models/todo.model';
import { TodoService } from '../../core/services/todo.service';
import { RouterLink } from '@angular/router';
import { TodoCard } from '../../shared/components/todo-card/todo-card';


@Component({
  selector: 'app-todo',
  imports: [RouterLink, TodoCard],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {
  private readonly modalService = inject(ModalService);
  protected readonly todoService = inject(TodoService);

  ngOnInit() {
    console.log(this.todoService.allToDos().length)
  }
  public openTaskCreationDialog(): void {
    const dialog = this.modalService.show(CreateTodoForm, {
      title: 'Create a new To-do',
      maxWidth: 'md',
      closeOnOverlayClick: true,
    });
    dialog.onResult.then((newTaskPayload: CreateToDoTaskCommand | null | undefined) => {
      if (newTaskPayload && typeof newTaskPayload === 'object') {
        this.todoService.createToDoTask(newTaskPayload);
      }
    });
  }
}
