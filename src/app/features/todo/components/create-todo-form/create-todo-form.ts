import { Component, computed, inject, signal } from '@angular/core';
import {
  ModalChildComponentBase,
} from '../../../../core/models/system.modal.design';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import {
  CreateToDoTaskCommand,
  TaskEnergyLevelType,
  ToDoTaskDto,
  UpdateToDoTaskDetailsCommand,
} from '../../../../core/models/todo.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { DateTimePicker } from '../../../../shared/components/date-time-picker/date-time-picker';
import { filter, Subject, takeUntil, tap } from 'rxjs';

export type ToDoFormMode = "CREATE" | "MODIFY";
@Component({
  selector: 'app-create-todo-form',
  imports: [ReactiveFormsModule, DateTimePicker],
  templateUrl: './create-todo-form.html',
  styleUrl: './create-todo-form.css',
})
export class CreateTodoForm extends ModalChildComponentBase<ToDoTaskDto> {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private originalToDoItem?: ToDoTaskDto;
  protected currentActionMode = signal<ToDoFormMode>('CREATE');
  protected isProcessing = signal<boolean>(false);
  public toDoForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(256)]],
    description: ['', Validators.maxLength(1000)],
    estimatedPomodoros: [1, [Validators.required, Validators.min(1)]],
    dueDate: [''],
    energyLevel: [2, [Validators.min(1), Validators.max(3)]],
    isPriority: [false],
  });
  public submitForm$ = new Subject<void>();
  public destroy$ = new Subject<void>();
  protected isDataUnedited = computed(() => {
    if (this.currentActionMode() === 'CREATE') return false;
    if (!this.originalToDoItem) return true;
    const currentLive = this.formLiveState();
    const isTitleSame = (currentLive.title?.trim() ?? '') === this.originalToDoItem.title;
    const isDescSame =
      (currentLive.description?.trim() ?? '') === this.originalToDoItem.description;
    const isPomoSame =
      Number(currentLive.estimatedPomodoros) === this.originalToDoItem.estimatedPomodoros;

    const currentLiveDate = currentLive.dueDate ? new Date(currentLive.dueDate).toISOString() : '';
    const originalDate = this.originalToDoItem.dueDate
      ? new Date(this.originalToDoItem.dueDate).toISOString()
      : '';
    const isDateSame = currentLiveDate === originalDate;
    const isEnergySame = currentLive.energyLevel === this.originalToDoItem.energyLevel;
    const isPrioritySame = currentLive.isPriority === this.originalToDoItem.isPriority;
    return isTitleSame && isDateSame && isDescSame && isPomoSame && isEnergySame && isPrioritySame;
  });

  private formLiveState = toSignal(this.toDoForm.valueChanges, {
    initialValue: this.toDoForm.getRawValue(),
  });
  ngOnInit() {
    if (this.payload) {
      this.currentActionMode.set('MODIFY');
      const payload = this.payload;
      this.originalToDoItem = { ...this.payload };
      console.log(payload.dueDate);
      this.toDoForm.patchValue({
        title: payload.title,
        description: payload.description ?? '',
        estimatedPomodoros: payload.estimatedPomodoros,
        dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : '',
        energyLevel: payload.energyLevel,
        isPriority: payload.isPriority,
      });
    }
    this.submitForm$
      .pipe(
        tap(() => {
          this.toDoForm.markAsTouched();
        }),
        filter(() => {
          const isFormInvalid = this.toDoForm.invalid;
          const isDueDateMissing = !this.toDoForm.get('dueDate')?.value;
          if (isFormInvalid || isDueDateMissing || this.isProcessing() || this.isDataUnedited())
            return false;
          this.isProcessing.set(true);
          return true;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: () => {
          const formValues = this.toDoForm.getRawValue();
          if (this.currentActionMode() === 'CREATE') {
            const createToDoTaskCommandPayload: CreateToDoTaskCommand = {
              userId: this.authService.currentUserId(),
              title: formValues.title.trim(),
              description: formValues.description.trim(),
              estimatedPomodoros: Number(formValues.estimatedPomodoros),
              dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
              energyLevel: Number(formValues.energyLevel) as TaskEnergyLevelType,
              isPriority: formValues.isPriority,
            };
            if (this.modalRef) this.modalRef.close(createToDoTaskCommandPayload);
          } else {
            const updateToDoTaskCommandPayload: UpdateToDoTaskDetailsCommand = {
              taskId: this.originalToDoItem!.id,
              userId: this.authService.currentUserId(),
              title: formValues.title.trim(),
              description: formValues.description.trim(),
              estimatedPomodoros: Number(formValues.estimatedPomodoros),
              dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
              energyLevel: Number(formValues.energyLevel) as TaskEnergyLevelType,
              isPriority: formValues.isPriority,
            };
            if (this.modalRef) {
              this.modalRef.close(updateToDoTaskCommandPayload);
            }
          }
          this.isProcessing.set(false);
        },
        error: (error) => {
          console.error('Modal form executtion thread collapsed', error);
          this.isProcessing.set(false);
          this.ngOnInit();
        },
      });
    }
  // public onSubmit(): void {
  //   if (this.toDoForm.invalid) return;
  //   this.isProcessing.set(true);
  //   const formValues = this.toDoForm.getRawValue();
  //   if (this.currentActionMode() === 'CREATE') {
  //     const createToDoTaskCommandPayload: CreateToDoTaskCommand = {
  //       userId: this.authService.currentUserId(),
  //       title: formValues.title.trim(),
  //       description: formValues.description.trim(),
  //       estimatedPomodoros: Number(formValues.estimatedPomodoros),
  //       dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
  //       energyLevel: Number(formValues.energyLevel) as TaskEnergyLevelType,
  //       isPriority: formValues.isPriority,
  //     };
  //     if (this.modalRef) {
  //       this.modalRef.close(createToDoTaskCommandPayload);
  //     }
  //   } else {
  //     const updateToDoTaskCommandPayload: UpdateToDoTaskDetailsCommand = {
  //       taskId: this.originalToDoItem!.id,
  //       userId: this.authService.currentUserId(),
  //       title: formValues.title.trim(),
  //       description: formValues.description.trim(),
  //       estimatedPomodoros: Number(formValues.estimatedPomodoros),
  //       dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
  //       energyLevel: Number(formValues.energyLevel) as TaskEnergyLevelType,
  //       isPriority: formValues.isPriority,
  //     };
  //     if (this.modalRef) {
  //       this.modalRef.close(updateToDoTaskCommandPayload);
  //     }
  //   }
  //   this.isProcessing.set(false);
  // }
  public onCancel(): void {
    if (this.modalRef) this.modalRef.close();
  }
  public ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
