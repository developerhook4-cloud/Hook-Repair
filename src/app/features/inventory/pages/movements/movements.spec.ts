import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovementsComponent } from './movements.component';

describe('Movements', () => {
  let component: MovementsComponent;
  let fixture: ComponentFixture<MovementsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovementsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MovementsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
