import { Component, computed, inject, signal } from '@angular/core';
import {
  ModalChildComponentBase,
} from '../../../../core/models/system.modal.design';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/services/auth';
import {
  CreateToDoTaskCommand,
  ToDoTaskDto,
  UpdateToDoTaskDetailsCommand,
} from '../../../../core/models/todo.model';
import { toSignal } from '@angular/core/rxjs-interop';
import { form } from '@angular/forms/signals';

export type ToDoFormMode = "CREATE" | "MODIFY";
@Component({
  selector: 'app-create-todo-form',
  imports: [ReactiveFormsModule],
  templateUrl: './create-todo-form.html',
  styleUrl: './create-todo-form.css',
})
export class CreateTodoForm extends ModalChildComponentBase<ToDoTaskDto> {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  private originalToDoItem?: ToDoTaskDto;
  protected currentActionMode = signal<ToDoFormMode>("CREATE");
  protected isProcessing = signal<boolean>(false);
  public toDoForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(256)]],
    description: ['', Validators.maxLength(1000)],
    estimatedPomodoros: [1, [Validators.required, Validators.min(1), Validators.maxLength(1000)]],
    dueDate: [''],
  });

  protected isDataUnedited = computed(() => {
    if(this.currentActionMode() === 'CREATE') return false;
    if(!this.originalToDoItem) return true;
    const currentLive = this.formLiveState();
    const isTitleSame = (currentLive.title?.trim() ?? '') === this.originalToDoItem.title;
    const isDescSame = (currentLive.description?.trim() ?? '') === this.originalToDoItem.description;
    const isPomoSame = Number(currentLive.estimatedPomodoros) === this.originalToDoItem.estimatedPomodoros;

    const currentLiveDate = currentLive.dueDate ? new Date(currentLive.dueDate).toISOString().slice(0, 10) : '';
    const originalDate = this.originalToDoItem.dueDate ? new Date(this.originalToDoItem.dueDate).toISOString().slice(0, 10) : '';
    const isDateSame = currentLiveDate === originalDate;
    return isTitleSame && isDateSame && isDescSame && isPomoSame;
  });

  private formLiveState = toSignal(this.toDoForm.valueChanges, {initialValue: this.toDoForm.getRawValue()});

  protected readonly minAvailableDate = computed(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  ngOnInit() {
    if(this.payload){
      this.currentActionMode.set('MODIFY');
      const payload = this.payload;
      this.originalToDoItem = {...this.payload};
      this.toDoForm.patchValue({
        title: payload.title,
        description: payload.description ?? '',
        estimatedPomodoros: payload.estimatedPomodoros,
        dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString().slice(0,10) : ''
      });

    }
  }
  public onSubmit(): void {
    if (this.toDoForm.invalid) return;
    this.isProcessing.set(true);
    const formValues = this.toDoForm.getRawValue();
    if(this.currentActionMode() === "CREATE"){
      const createToDoTaskCommandPayload: CreateToDoTaskCommand = {
        userId: this.authService.currentUserId(),
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        estimatedPomodoros: Number(formValues.estimatedPomodoros),
        dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString() : null,
      };
      if (this.modalRef) {
        this.modalRef.close(createToDoTaskCommandPayload);
      }
    }else{
      const updateToDoTaskCommandPayload: UpdateToDoTaskDetailsCommand = {
        taskId: this.originalToDoItem!.id,
        userId: this.authService.currentUserId(),
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        estimatedPomodoros: Number(formValues.estimatedPomodoros),
        dueDate: formValues.dueDate ? new Date(formValues.dueDate).toISOString().slice(0, 10) : ''
      };
      if(this.modalRef){
        this.modalRef.close(updateToDoTaskCommandPayload);
      }
    }
    this.isProcessing.set(false);
  }
  public onCancel(): void {
    if (this.modalRef) this.modalRef.close();
  }
}
