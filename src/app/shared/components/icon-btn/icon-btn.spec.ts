import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IconBtn } from './icon-btn';

describe('IconBtn', () => {
  let component: IconBtn;
  let fixture: ComponentFixture<IconBtn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconBtn],
    }).compileComponents();

    fixture = TestBed.createComponent(IconBtn);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
