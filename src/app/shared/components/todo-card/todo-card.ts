import { Component, ElementRef, HostListener, inject, input, InputSignal, signal } from '@angular/core';
import { ToDoTaskDto } from '../../../core/models/todo.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-todo-card',
  imports: [RouterLink],
  templateUrl: './todo-card.html',
  styleUrl: './todo-card.css',
})
export class TodoCard {
  private readonly elementRef = inject(ElementRef);
  public todoTaskItem = input<ToDoTaskDto>();
  public isPopupHidden = signal<boolean>(true);

  public toggleContextPopup(event: MouseEvent): void{
    event.stopPropagation();
    this.isPopupHidden.set(!this.isPopupHidden());
  }

  @HostListener('document:click',['$event'])
  public onGlobalClick(event: MouseEvent): void{
    if (this.isPopupHidden()) return;
    const clickedElement = event.target as HTMLElement;
    const isClickedInsideCard = this.elementRef.nativeElement.contains(clickedElement);
    if(!isClickedInsideCard){
      this.isPopupHidden.set(true)
    }
  }

  public HandleEdit(): void{
    this.isPopupHidden.set(true);
  }
  public HandleDelete(): void{
    this.isPopupHidden.set(true);
  }
}
