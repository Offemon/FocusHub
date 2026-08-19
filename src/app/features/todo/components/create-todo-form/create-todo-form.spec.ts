import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTodoForm } from './create-todo-form';

describe('CreateTodoForm', () => {
  let component: CreateTodoForm;
  let fixture: ComponentFixture<CreateTodoForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateTodoForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateTodoForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
