import { Component } from '@angular/core';
import { ModalChildComponentBase } from '../../../../core/models/system.modal.design';

@Component({
  selector: 'app-mcc-confirm',
  imports: [],
  templateUrl: './mcc-confirm.html',
  styleUrl: './mcc-confirm.css',
})
export class MccConfirm extends ModalChildComponentBase<string> {
  protected confirmationMessage!: string
  protected HandleConfirm(): void {
    this.modalRef.close(true);
  }
  protected HandleCancel(): void {
    this.modalRef.close(false);
  }
  ngOnInit() {
    this.confirmationMessage = this.payload;
  }
}
