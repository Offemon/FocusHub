import { Component, input, InputSignal, output } from '@angular/core';
import { MaterialIcons } from '../../../core/models/google.material.icons';

@Component({
  selector: 'app-pill-btn',
  imports: [],
  templateUrl: './pill-btn.html',
  styleUrl: './pill-btn.css',
})
export class PillBtn {
  public btnIcon = input.required<MaterialIcons>();
  public btnLabel = input.required<string>();

  public onClick = output<MouseEvent>();

  protected HandleClick(event: MouseEvent){
    event.stopPropagation();
    this.onClick.emit(event);
  }
}
