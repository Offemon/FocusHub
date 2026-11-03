import { Component, input } from '@angular/core';
import { SessionDto } from '../../../core/models/session.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-session-row-item',
  imports: [DatePipe],
  templateUrl: './session-row-item.html',
  styleUrl: './session-row-item.css',
})
export class SessionRowItem {
  public readonly sessionData = input.required<SessionDto>();
}
