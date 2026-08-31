import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleIconBtn } from './toggle-icon-btn';

describe('ToggleIconBtn', () => {
  let component: ToggleIconBtn;
  let fixture: ComponentFixture<ToggleIconBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToggleIconBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(ToggleIconBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
