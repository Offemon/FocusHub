import { Component, computed, forwardRef, input, output, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-time-picker.html',
  styleUrl: './date-time-picker.css',
  providers:[
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePicker),
      multi: true
    }
  ]
})
export class DateTimePicker implements ControlValueAccessor{
  // public value = input<string | null>(null);
  public labelText = input<string>('Select Deadline Schedule');
  public valueChange = output<string | null>();

  protected readonly localDate = signal<string>('');
  protected readonly localTime = signal<string>('00:00');

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  protected isDisabled = signal<boolean>(false);
  public writeValue(incomingTimestamp: string | null): void {
    if(incomingTimestamp){
      try{
        const parsedDate = new Date(incomingTimestamp);
        if(!isNaN(parsedDate.getTime())){
          this.localDate.set(parsedDate.toISOString().slice(0,10));
          this.localTime.set(parsedDate.toISOString().slice(11, 16));
          return;
        }
      }
      catch(e){
        console.warn('Failed parsing template timestamp rules', e);
      }
    }
    this.localDate.set('');
    this.localTime.set('00:00');
  }
  public registerOnChange(fn: (value: string | null) => void): void{
    this.onChange = fn;
  }
  public registerOnTouched(fn: () => void): void{
    this.onTouched = fn;
  }
  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
  protected onInputMutated(newDate: string, newTime: string): void {
    if(this.isDisabled()) return;
    this.localDate.set(newDate);
    this.localTime.set(newTime);
    this.onTouched();

    if (!newDate) {
      this.valueChange.emit(null);
      return;
    }
    const combinedLocalString = `${newDate}T${newTime || '00:00'}`;
    const absoluteUtcDate = new Date(combinedLocalString);
    if (isNaN(absoluteUtcDate.getTime())) {
      this.onChange(absoluteUtcDate.toDateString());
    } else {
      this.onChange(null);
    }
  }
  protected readonly minAvailableDate = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
}
