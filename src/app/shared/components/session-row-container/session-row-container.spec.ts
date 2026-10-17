import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionRowContainer } from './session-row-container';

describe('SessionRowContainer', () => {
  let component: SessionRowContainer;
  let fixture: ComponentFixture<SessionRowContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionRowContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionRowContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
