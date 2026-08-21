export interface ModalOptions {
  title: string;
  closeOnOverlayClick?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}
export interface ModalReference {
  close: (result?: any) => void;
  onResult: Promise<any>;
}
export interface IModalChildComponent<TData = any> {
  initModalRef(ref: ModalReference): void;
  unloadPayload(sourcePayload: IPayloadContainer<TData>): void;
}
export interface IPayloadContainer<TData = any> {
  payload: TData;
}

export abstract class ModalChildComponentBase<TData = any> implements IModalChildComponent<TData> {
  protected modalRef!: ModalReference;
  protected payload!: TData;
  initModalRef(ref: ModalReference): void {
    this.modalRef = ref;
  }
  unloadPayload(sourcePayload: IPayloadContainer<TData>): void {
    this.payload = { ...sourcePayload.payload };
  }
}
