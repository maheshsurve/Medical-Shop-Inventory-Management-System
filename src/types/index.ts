export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: 'admin' | 'manager' | 'employee';
  email: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface Medicine {
  id: string;
  name: string;
  description?: string;
  category: string;
  manufacturer: string;
  batchNumber: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  quantity: number;
  minStockLevel: number;
  manufactureDate: string;
  expiryDate: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  paymentTerms?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  status: 'pending' | 'ordered' | 'received' | 'cancelled';
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  totalAmount: number;
  paymentStatus: 'unpaid' | 'partial' | 'paid';
  items: PurchaseOrderItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseOrderItem {
  id: string;
  medicineId: string;
  medicineName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
}

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'other';
  paymentStatus: 'paid' | 'unpaid' | 'partial';
  saleDate: string;
  createdBy: string;
  createdAt: string;
}

export interface SaleItem {
  id: string;
  medicineId: string;
  medicineName: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiry' | 'system';
  title: string;
  message: string;
  medicineId?: string;
  medicineName?: string;
  isRead: boolean;
  createdAt: string;
}

export interface DashboardStats {
  totalMedicines: number;
  lowStockCount: number;
  expiringCount: number;
  expiredCount: number;
  todaySales: number;
  monthlySales: number;
  pendingOrders: number;
}