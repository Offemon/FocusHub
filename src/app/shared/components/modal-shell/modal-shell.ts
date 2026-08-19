import { Component, ComponentRef, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { ModalOptions, ModalReference } from '../../../core/models/system.modal.design';

@Component({
  selector: 'app-modal-shell',
  imports: [],
  templateUrl: './modal-shell.html',
  styleUrl: './modal-shell.css',
})
export class ModalShell {
  @ViewChild('bodyTarget', {read: ViewContainerRef, static: true})
  private bodyTarget!: ViewContainerRef;

  public options = signal<ModalOptions>({title: 'System Message'});
  private controller!: ModalReference;

  public registerController(ctrl: ModalReference): void{
    this.controller = ctrl;
  }

  public projectBody(componentRef: ComponentRef<any>): void {
    this.bodyTarget.insert(componentRef.hostView);
  }

  public onDismiss(): void{
    if(this.options().closeOnOverlayClick !== false){
      this.controller.close();
    }
  }
  protected onCloseClick(): void{
    this.controller.close();
  }
}
