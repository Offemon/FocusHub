export interface ModalOptions {
  title: string;
  closeOnOverlayClick?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}
export interface ModalReference {
  close: (result?: any) => void;
  onResult: Promise<any>;
}
export interface IModalChildComponent<T = any>{
  initModalRef(ref: ModalReference): void;
  unloadPayload(sourcePayload: IPayloadContainer<T>): void;
}
export interface IPayloadContainer<T = any>{
  payload: T;
}

export abstract class ModalChildComponentBase<TPayload = any> implements IModalChildComponent<TPayload> {
  protected modalRef!: ModalReference;
  protected payload!: TPayload;
  initModalRef(ref: ModalReference):void {
    this.modalRef = ref;
  }
  unloadPayload(sourcePayload: IPayloadContainer<TPayload>):void {
    this.payload = {...sourcePayload.payload};
  }
}
