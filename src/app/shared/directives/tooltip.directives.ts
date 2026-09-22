import {
  ComponentRef,
  Directive,
  ElementRef, HostListener,
  inject,
  input,
  ViewContainerRef,
} from '@angular/core';
import { Tooltip } from '../components/tooltip/tooltip';

@Directive({
  selector: '[Tooltip]',
  standalone: true
})
export class TooltipDirective{
  private readonly elementRef = inject(ElementRef);
  private readonly viewContainerRef = inject(ViewContainerRef);
  private componentRef: ComponentRef<Tooltip> | null = null;

  public appTooltip = input.required<string>({alias: 'Tooltip'});

  @HostListener('mouseenter')
  public onMouseEnter(): void{
    if(this.componentRef) return;
    this.componentRef = this.viewContainerRef.createComponent(Tooltip);
    this.componentRef.instance.text = this.appTooltip as any;
    const tooltipElement = this.componentRef.location.nativeElement as HTMLElement;
    const hostElement = this.elementRef.nativeElement as HTMLElement;

    tooltipElement.style.position = 'fixed';
    document.body.appendChild(tooltipElement);
    const hostRect = hostElement.getBoundingClientRect();
    const tooltipRect = tooltipElement.getBoundingClientRect();
    const calculatedTop = hostRect.top - (tooltipRect.height * 2.5);
    const calculatedLeft = hostRect.left - (tooltipRect.width * 2.5);
    tooltipElement.style.top = `${calculatedTop}px`;
    tooltipElement.style.left = `${calculatedLeft}px`;
  }

  @HostListener('mouseleave')
  @HostListener('click')
  public onMouseLeave(): void{
    if(this.componentRef){
      this.componentRef.destroy();
      this.componentRef = null;
    }
  }
}
