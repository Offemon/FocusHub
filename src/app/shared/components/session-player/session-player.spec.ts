import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionPlayer } from './session-player';

describe('SessionPlayer', () => {
  let component: SessionPlayer;
  let fixture: ComponentFixture<SessionPlayer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SessionPlayer],
    }).compileComponents();

    fixture = TestBed.createComponent(SessionPlayer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
