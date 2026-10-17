import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionRowItem } from './session-row-item';

describe('SessionRowItem', () => {
  let component: SessionRowItem;
  let fixture: ComponentFixture<SessionRowItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionRowItem],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionRowItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
