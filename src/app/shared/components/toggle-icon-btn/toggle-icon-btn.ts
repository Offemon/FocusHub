import { Component, computed, input, model, output, signal } from '@angular/core';
import { MaterialIcons } from '../../../core/models/google.material.icons';

export type BooleanKeysOf<T> = {
  [K in keyof T]: T[K] extends boolean ? K : never;
}[keyof T];

@Component({
  selector: 'app-toggle-icon-btn',
  imports: [],
  templateUrl: './toggle-icon-btn.html',
  styleUrl: './toggle-icon-btn.css',
})
export class ToggleIconBtn<T extends object> {
  public toggleTarget = model.required<T>()
  public activeIconBtnName = input.required<MaterialIcons>();
  public inactiveIconBtnName = input.required<MaterialIcons>();
  public boolProperty = input.required<BooleanKeysOf<T>>();

  public toggled = output<T>()
  protected readonly isActive = computed(() =>{
    const obj = this.toggleTarget();
    const key = this.boolProperty() as unknown as keyof T;
    return !!(obj[key]);
  });
  protected HandleToggle(event: MouseEvent): void{
    event.stopPropagation();
    const currentObj = this.toggleTarget();
    const key = this.boolProperty() as unknown as keyof T;

    const updatedObj: T = {
      ...currentObj,
      [key]: !currentObj[key]
    }
    // this.toggled.emit(updatedObj);
    const toggleT = this.toggleTarget();
    console.log(toggleT[key]);
    this.toggleTarget.set(updatedObj)
  }
}
