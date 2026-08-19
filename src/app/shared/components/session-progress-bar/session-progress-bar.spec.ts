import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionProgressBar } from './session-progress-bar';

describe('SessionProgressBar', () => {
  let component: SessionProgressBar;
  let fixture: ComponentFixture<SessionProgressBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionProgressBar],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionProgressBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
