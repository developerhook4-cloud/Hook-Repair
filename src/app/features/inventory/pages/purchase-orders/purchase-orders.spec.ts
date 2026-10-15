import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrdersComponent } from './purchase-orders.component';

describe('PurchaseOrders', () => {
  let component: PurchaseOrdersComponent;
  let fixture: ComponentFixture<PurchaseOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseOrdersComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PurchaseOrdersComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
