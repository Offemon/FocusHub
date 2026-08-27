import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodoCardGrid } from './todo-card-grid';

describe('TodoCardGrid', () => {
  let component: TodoCardGrid;
  let fixture: ComponentFixture<TodoCardGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodoCardGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(TodoCardGrid);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
