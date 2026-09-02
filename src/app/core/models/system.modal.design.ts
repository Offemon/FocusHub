export interface ModalOptions {
  title: string;
  closeOnOverlayClick?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}
export interface ModalReference {
  close: (result?: any) => void;
  onResult: Promise<any>;
}
export interface IModalChildComponent<TData = void> {
  initModalRef(ref: ModalReference): void;
  unloadPayload(sourcePayload: IPayloadContainer<TData>): void;
}
export interface IPayloadContainer<TData = void> {
  payload: TData;
}

export abstract class ModalChildComponentBase<TData = void> implements IModalChildComponent<TData> {
  protected modalRef!: ModalReference;
  protected payload!: TData;
  initModalRef(ref: ModalReference): void {
    this.modalRef = ref;
  }
  unloadPayload(sourcePayload: IPayloadContainer<TData>): void {
    const data = sourcePayload.payload;
    if(data && typeof data === 'object')
      this.payload = { ...sourcePayload.payload };
    else
      this.payload = data;
  }
}
