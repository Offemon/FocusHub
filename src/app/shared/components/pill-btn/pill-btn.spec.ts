import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PillBtn } from './pill-btn';

describe('PillBtn', () => {
  let component: PillBtn;
  let fixture: ComponentFixture<PillBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PillBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(PillBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
