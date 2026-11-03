import { Component, input } from '@angular/core';
import { ApiResponse, PagedResult } from '../../../core/models/ApiResponse';
import { SessionDto } from '../../../core/models/session.model';
import { Banner } from '../banner/banner';
import { Variant } from '../../../core/models/Variant';
import { Severity } from '../../../core/models/Severity';
import { SessionRowItem } from '../session-row-item/session-row-item';

@Component({
  selector: 'app-session-row-container',
  imports: [Banner, SessionRowItem],
  templateUrl: './session-row-container.html',
  styleUrl: './session-row-container.css',
})
export class SessionRowContainer {
  public readonly resolvedSessionsContainer = input.required<ApiResponse<PagedResult<SessionDto>>>();

  protected readonly Variant = Variant;
  protected readonly Severity = Severity;
}
