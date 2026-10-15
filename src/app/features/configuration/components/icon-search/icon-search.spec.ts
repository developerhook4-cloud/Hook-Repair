import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { IconSearchComponent } from './icon-search.component';

describe('IconSearch', () => {
  let component: IconSearchComponent;
  let fixture: ComponentFixture<IconSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IconSearchComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(IconSearchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
