import { Component, input, output } from '@angular/core';
import { GoogleIcons, MaterialIcons } from '../../../core/models/google.material.icons';

@Component({
  selector: 'app-icon-btn',
  imports: [],
  templateUrl: './icon-btn.html',
  styleUrl: './icon-btn.css',
})
export class IconBtn {
  public materialIconName = input.required<MaterialIcons>();
  public btnAriaLabel = input<string>("Action Trigger");

  public onClick = output<MouseEvent>();

  protected HandleClick(event: MouseEvent):void {
    event.stopPropagation();
    this.onClick.emit(event);
  }
}
