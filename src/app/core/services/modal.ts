import { ApplicationRef, inject, Service, EnvironmentInjector, Type, createComponent } from '@angular/core';
import {
  IPayloadContainer,
  ModalChildComponentBase,
  ModalOptions,
  ModalReference,
} from '../models/system.modal.design';
import { ModalShell } from '../../shared/components/modal-shell/modal-shell';

@Service()
export class ModalService {
  private readonly appRef = inject(ApplicationRef);
  private readonly injector = inject(EnvironmentInjector);

  public show<TData, TComp extends ModalChildComponentBase<TData>>(componentType: Type<TComp>, options: ModalOptions, payloadContainer?: IPayloadContainer<TData>): ModalReference {
    let resolveResult: (value: any) => void;
    const resultPromise = new Promise<any>((resolve) =>{
      resolveResult = resolve;
    });
    const shellRef = createComponent(ModalShell,{environmentInjector: this.injector})

    shellRef.instance.options.set(options);

    const bodyRef = createComponent(componentType, {environmentInjector: this.injector});

    shellRef.instance.projectBody(bodyRef);

    this.appRef.attachView(shellRef.hostView);
    document.body.appendChild(shellRef.location.nativeElement);

    const modalRef: ModalReference = {
      onResult: resultPromise,
      close: (result?: any) => {
        resolveResult(result);
        this.appRef.detachView(shellRef.hostView);
        shellRef.destroy();
        bodyRef.destroy();
      }
    };
    bodyRef.instance.initModalRef(modalRef)
    if(payloadContainer)
      bodyRef.instance.unloadPayload(payloadContainer);
    shellRef.instance.registerController(modalRef);
    return modalRef;
  }
}
