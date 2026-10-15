import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationsPageComponent } from './organizations';

describe('Organizations', () => {
  let component: OrganizationsPageComponent;
  let fixture: ComponentFixture<OrganizationsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationsPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationsPageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
