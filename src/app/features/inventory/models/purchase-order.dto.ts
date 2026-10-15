interface PurchaseOrderLine {
  id?: string;
  productId: string;
  productName?: string;
  quantity: number;
  unitCost?: number;
  subtotal?: number;
}

export interface PurchaseOrderRequest {
  supplierId: string;
  products: PurchaseOrderLine[];
}

export interface PurchaseOrderResponse extends PurchaseOrderRequest {
  id: string;
  purchaseOrderNumber: number;
  userId: string;
  createdAtUtc: string;
  supplierName: string;
  userName: string;
  status:
    'Pending' | 'Waiting' | 'InProgress' | 'ReceivedPartially' | 'Received' | 'InRMA' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid';
  total: number;
}
