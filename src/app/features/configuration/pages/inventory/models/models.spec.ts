import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelsComponent } from './models.component';

describe('Models', () => {
  let component: ModelsComponent;
  let fixture: ComponentFixture<ModelsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModelsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
