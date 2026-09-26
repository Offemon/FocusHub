import {
  Component,
  computed,
  forwardRef,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { interval, Subject, Subscription, takeUntil } from 'rxjs';

@Component({
  selector: 'app-date-time-picker',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './date-time-picker.html',
  styleUrl: './date-time-picker.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateTimePicker),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DateTimePicker),
      multi: true,
    },
  ],
})
export class DateTimePicker implements ControlValueAccessor, OnInit, OnDestroy, Validator {
  // public value = input<string | null>(null);
  public labelText = input<string>('Select Deadline Schedule');
  public valueChange = output<string | null>();

  protected readonly localDate = signal<string>('');
  protected readonly localTime = signal<string>('00:00');

  private onChange: (value: string | null) => void = () => {};
  private onTouched: () => void = () => {};
  private onValidatorChange: () => void = () => {};
  protected isDisabled = signal<boolean>(false);
  protected isPastTimeInvalid = signal<boolean>(false);

  private readonly destroy$ = new Subject<void>();
  protected clockPollSubscription: Subscription | null = null;
  public validate(_control: AbstractControl): ValidationErrors | null {
    if (this.isPastTimeInvalid()) {
      return {
        pastDateAnomaly: {
          message: 'Selected deaedline schedule has elapsed into the past.',
        },
      };
    }
    return null;
  }
  public registerOnValidatorChange(fn: { (): void }) {
    this.onValidatorChange = fn;
  }
  public ngOnInit() {
    this.clockPollSubscription = interval(5000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          console.log('Tik Tok');
          if (this.localDate() && this.localTime()) {
            this.validateAndEmit(this.localDate(), this.localTime());
          }
        },
      });
  }
  public writeValue(incomingTimestamp: string | null): void {
    if (!incomingTimestamp) {
      this.localDate.set('');
      this.localTime.set('00:00');
      return;
    }
    try {
      const parsedDate = new Date(incomingTimestamp);
      if (!isNaN(parsedDate.getTime())) {
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const hours = String(parsedDate.getHours()).padStart(2, '0');
        const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
        this.localDate.set(`${year}-${month}-${day}`);
        this.localTime.set(`${hours}:${minutes}`);
        this.isPastTimeInvalid.set(false);
        return;
      }
    } catch (e) {
      console.warn('Failed parsing template timestamp rules', e);
    }

    this.localDate.set('');
    this.localTime.set('00:00');
  }
  public registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }
  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  public setDisabledState?(isDisabled: boolean): void {
    this.isDisabled.set(isDisabled);
  }
  protected onInputMutated(newDate: string, newTime: string): void {
    if (this.isDisabled()) return;
    const sanitizedTime = newTime && newTime.trim() !== '' ? newTime : '00:00';
    this.localDate.set(newDate);
    this.localTime.set(sanitizedTime);
    this.onTouched();
    this.validateAndEmit(newDate, newTime || '00:00');
  }
  protected readonly minAvailableDate = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });

  protected readonly dynamicMinTime = computed(() => {
    const todayStr = this.minAvailableDate();
    if (this.localDate() === todayStr) {
      const futureRunway = new Date(Date.now() + 60 * 60 * 1000);
      const hours = String(futureRunway.getHours()).padStart(2, '0');
      const mins = String(futureRunway.getMinutes()).padStart(2, '0');
      return `${hours}:${mins}`;
    }
    return '';
  });
  private validateAndEmit(dateStr: string, timeStr: string): void {
    if (!dateStr || dateStr.trim() === '') {
      this.isPastTimeInvalid.set(false);
      this.onChange(null);
      this.onValidatorChange();
      return;
    }
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes] = timeStr.split(':').map(Number);
      if (year && month && day) {
        const absoluteLocalDateObject = new Date(year, month - 1, day, hours, minutes, 0, 0);
        if (!isNaN(absoluteLocalDateObject.getTime())) {
          const minimumAllowedTimestamp = Date.now() + 60 * 60 * 1000;
          if (absoluteLocalDateObject.getTime() < minimumAllowedTimestamp) {
            this.isPastTimeInvalid.set(true);
            this.onChange(null);
            this.onValidatorChange();
            return;
          }
          this.isPastTimeInvalid.set(false);
          this.onChange(absoluteLocalDateObject.toISOString());
          this.onValidatorChange();
          return;
        }
      }
      this.onChange(null);
      this.onValidatorChange();
    } catch (e) {
      console.error('Date assembly error:', e);
      this.onChange(null);
      this.onValidatorChange();
    }
  }
  public ngOnDestroy() {
    if (this.clockPollSubscription) this.clockPollSubscription.unsubscribe();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
