import { computed, Service, signal } from '@angular/core';
import { SnackBarMessage, SnackBarState, SnackBarType } from '../models/system.snackbar.design';

@Service()
export class SnackbarService {
  private readonly queueState = signal<SnackBarMessage[]>([]);
  public activeSnacks = computed(() => this.queueState());

  public show(message: string, type: SnackBarType, duration: number = 5000): void{
    const snackId = crypto.randomUUID();
    const newSnack: SnackBarMessage = {
      id: snackId,
      message,
      type,
      duration
    };
    this.queueState.update(currentQueue => [...currentQueue, newSnack]);
    setTimeout(()=>{
      this.dismiss(newSnack.id);
    },duration);
  }
  public showSuccess(message: string): void{
    this.show(message, SnackBarState.Success);
  }
  public showError(message: string): void{
    this.show(message, SnackBarState.Error);
  }
  public showWarning(message: string): void {
    this.show(message, SnackBarState.Warning);
  }
  public showInfo(message: string): void{
    this.show(message, SnackBarState.Info);
  }
  public dismiss(id: string): void{
    this.queueState.update(currentQueue =>
      currentQueue.filter(snack => snack.id !== id)
    );
  }
}
