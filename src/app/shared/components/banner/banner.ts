import { Component, input, computed } from '@angular/core';
import { Severity, SeverityType } from '../../../core/models/Severity';
import { Variant, VariantType } from '../../../core/models/Variant';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
})
export class Banner {
  public severity = input<SeverityType>(`${Severity.Info}`);
  public variant = input<VariantType>(`${Variant.Filled}`);
  public message = input<string>();

  protected computedClasses = computed(() => {
    return `banner-box severity-${this.severity().toLowerCase()} variant-${this.variant().toLowerCase()}`;
  });
}
