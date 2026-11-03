import { Component, computed, contentChildren, input, output } from '@angular/core';
import { TodoCard } from '../todo-card/todo-card';
import {ToDoTaskDto} from "../../../core/models/todo.model";
import {Banner} from "../banner/banner";
import {Severity} from "../../../core/models/Severity";
import {Variant} from "../../../core/models/Variant";

@Component({
  selector: 'app-todo-card-grid',
  imports: [TodoCard, Banner],
  templateUrl: './todo-card-grid.html',
  styleUrl: './todo-card-grid.css',
})
export class TodoCardGrid {
  public isCompact = input<boolean>(false);
  public readonly validChildComponent = contentChildren(TodoCard);
  public readonly tasks = input.required<ToDoTaskDto[]>();
  public readonly virtualized = input<boolean>(false);
  public readonly hasNextPage = input<boolean>(false);
  public readonly hasPreviousPage = input<boolean>(false);
  public readonly pageSize = input<number>(8);
  public readonly currentPage = input<number>(1);
  public readonly totalPages = input<number>(1);

  public readonly loadMore = output<void>();
  public readonly pageChange = output<number>();

  protected readonly pageArray = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });
  protected readonly Severity = Severity;
  protected readonly Variant = Variant;
}
