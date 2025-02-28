import { User, Medicine, Supplier, PurchaseOrder, Sale, Alert } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Default admin user
const defaultAdmin: User = {
  id: uuidv4(),
  username: 'admin',
  password: 'admin123', // In a real app, this would be hashed
  name: 'Admin User',
  role: 'admin',
  email: 'admin@medicalshop.com',
  createdAt: new Date().toISOString(),
};

// Initialize local storage with default data
export const initializeLocalStorage = () => {
  if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([defaultAdmin]));
  }
  
  if (!localStorage.getItem('medicines')) {
    localStorage.setItem('medicines', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('suppliers')) {
    localStorage.setItem('suppliers', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('purchaseOrders')) {
    localStorage.setItem('purchaseOrders', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('sales')) {
    localStorage.setItem('sales', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('alerts')) {
    localStorage.setItem('alerts', JSON.stringify([]));
  }
  
  if (!localStorage.getItem('currentUser')) {
    localStorage.setItem('currentUser', '');
  }
};

// User related functions
export const getUsers = (): User[] => {
  const users = localStorage.getItem('users');
  return users ? JSON.parse(users) : [];
};

export const getUserById = (id: string): User | undefined => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

export const addUser = (user: Omit<User, 'id' | 'createdAt'>): User => {
  const newUser: User = {
    ...user,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  
  const users = getUsers();
  localStorage.setItem('users', JSON.stringify([...users, newUser]));
  return newUser;
};

export const updateUser = (user: User): User => {
  const users = getUsers();
  const updatedUsers = users.map(u => u.id === user.id ? user : u);
  localStorage.setItem('users', JSON.stringify(updatedUsers));
  return user;
};

export const deleteUser = (id: string): boolean => {
  const users = getUsers();
  const filteredUsers = users.filter(user => user.id !== id);
  
  if (filteredUsers.length === users.length) {
    return false;
  }
  
  localStorage.setItem('users', JSON.stringify(filteredUsers));
  return true;
};

export const authenticateUser = (username: string, password: string): User | null => {
  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password);
  
  if (user) {
    const updatedUser = {
      ...user,
      lastLogin: new Date().toISOString(),
    };
    updateUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    return updatedUser;
  }
  
  return null;
};

export const getCurrentUser = (): User | null => {
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? JSON.parse(currentUser) : null;
};

export const logoutUser = (): void => {
  localStorage.setItem('currentUser', '');
};

// Medicine related functions
export const getMedicines = (): Medicine[] => {
  const medicines = localStorage.getItem('medicines');
  return medicines ? JSON.parse(medicines) : [];
};

export const getMedicineById = (id: string): Medicine | undefined => {
  const medicines = getMedicines();
  return medicines.find(medicine => medicine.id === id);
};

export const addMedicine = (medicine: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>): Medicine => {
  const now = new Date().toISOString();
  const newMedicine: Medicine = {
    ...medicine,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  const medicines = getMedicines();
  localStorage.setItem('medicines', JSON.stringify([...medicines, newMedicine]));
  
  // Check if we need to create alerts
  checkAndCreateAlerts(newMedicine);
  
  return newMedicine;
};

export const updateMedicine = (medicine: Medicine): Medicine => {
  const medicines = getMedicines();
  const updatedMedicine = {
    ...medicine,
    updatedAt: new Date().toISOString(),
  };
  
  const updatedMedicines = medicines.map(m => m.id === medicine.id ? updatedMedicine : m);
  localStorage.setItem('medicines', JSON.stringify(updatedMedicines));
  
  // Check if we need to create alerts
  checkAndCreateAlerts(updatedMedicine);
  
  return updatedMedicine;
};

export const deleteMedicine = (id: string): boolean => {
  const medicines = getMedicines();
  const filteredMedicines = medicines.filter(medicine => medicine.id !== id);
  
  if (filteredMedicines.length === medicines.length) {
    return false;
  }
  
  localStorage.setItem('medicines', JSON.stringify(filteredMedicines));
  return true;
};

// Supplier related functions
export const getSuppliers = (): Supplier[] => {
  const suppliers = localStorage.getItem('suppliers');
  return suppliers ? JSON.parse(suppliers) : [];
};

export const getSupplierById = (id: string): Supplier | undefined => {
  const suppliers = getSuppliers();
  return suppliers.find(supplier => supplier.id === id);
};

export const addSupplier = (supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier => {
  const now = new Date().toISOString();
  const newSupplier: Supplier = {
    ...supplier,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  
  const suppliers = getSuppliers();
  localStorage.setItem('suppliers', JSON.stringify([...suppliers, newSupplier]));
  return newSupplier;
};

export const updateSupplier = (supplier: Supplier): Supplier => {
  const suppliers = getSuppliers();
  const updatedSupplier = {
    ...supplier,
    updatedAt: new Date().toISOString(),
  };
  
  const updatedSuppliers = suppliers.map(s => s.id === supplier.id ? updatedSupplier : s);
  localStorage.setItem('suppliers', JSON.stringify(updatedSuppliers));
  return updatedSupplier;
};

export const deleteSupplier = (id: string): boolean => {
  const suppliers = getSuppliers();
  const filteredSuppliers = suppliers.filter(supplier => supplier.id !== id);
  
  if (filteredSuppliers.length === suppliers.length) {
    return false;
  }
  
  localStorage.setItem('suppliers', JSON.stringify(filteredSuppliers));
  return true;
};

// Purchase Order related functions
export const getPurchaseOrders = (): PurchaseOrder[] => {
  const purchaseOrders = localStorage.getItem('purchaseOrders');
  return purchaseOrders ? JSON.parse(purchaseOrders) : [];
};

export const getPurchaseOrderById = (id: string): PurchaseOrder | undefined => {
  const purchaseOrders = getPurchaseOrders();
  return purchaseOrders.find(order => order.id === id);
};

export const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): PurchaseOrder => {
  const now = new Date().toISOString();
  const orders = getPurchaseOrders();
  
  // Generate order number (PO-YYYYMMDD-XXX)
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const orderCount = orders.length + 1;
  const orderNumber = `PO-${dateStr}-${String(orderCount).padStart(3, '0')}`;
  
  const newOrder: PurchaseOrder = {
    ...order,
    id: uuidv4(),
    orderNumber,
    createdAt: now,
    updatedAt: now,
  };
  
  localStorage.setItem('purchaseOrders', JSON.stringify([...orders, newOrder]));
  return newOrder;
};

export const updatePurchaseOrder = (order: PurchaseOrder): PurchaseOrder => {
  const orders = getPurchaseOrders();
  const updatedOrder = {
    ...order,
    updatedAt: new Date().toISOString(),
  };
  
  const updatedOrders = orders.map(o => o.id === order.id ? updatedOrder : o);
  localStorage.setItem('purchaseOrders', JSON.stringify(updatedOrders));
  
  // If order is received, update medicine quantities
  if (order.status === 'received' && order.receivedDate) {
    order.items.forEach(item => {
      if (item.receivedQuantity && item.receivedQuantity > 0) {
        const medicine = getMedicineById(item.medicineId);
        if (medicine) {
          const updatedMedicine = {
            ...medicine,
            quantity: medicine.quantity + item.receivedQuantity,
          };
          updateMedicine(updatedMedicine);
        }
      }
    });
  }
  
  return updatedOrder;
};

export const deletePurchaseOrder = (id: string): boolean => {
  const orders = getPurchaseOrders();
  const filteredOrders = orders.filter(order => order.id !== id);
  
  if (filteredOrders.length === orders.length) {
    return false;
  }
  
  localStorage.setItem('purchaseOrders', JSON.stringify(filteredOrders));
  return true;
};

// Sale related functions
export const getSales = (): Sale[] => {
  const sales = localStorage.getItem('sales');
  return sales ? JSON.parse(sales) : [];
};

export const getSaleById = (id: string): Sale | undefined => {
  const sales = getSales();
  return sales.find(sale => sale.id === id);
};

export const addSale = (sale: Omit<Sale, 'id' | 'invoiceNumber' | 'createdAt'>): Sale => {
  const now = new Date().toISOString();
  const sales = getSales();
  
  // Generate invoice number (INV-YYYYMMDD-XXX)
  const date = new Date();
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  const saleCount = sales.length + 1;
  const invoiceNumber = `INV-${dateStr}-${String(saleCount).padStart(3, '0')}`;
  
  const newSale: Sale = {
    ...sale,
    id: uuidv4(),
    invoiceNumber,
    createdAt: now,
  };
  
  localStorage.setItem('sales', JSON.stringify([...sales, newSale]));
  
  // Update medicine quantities
  newSale.items.forEach(item => {
    const medicine = getMedicineById(item.medicineId);
    if (medicine) {
      const updatedMedicine = {
        ...medicine,
        quantity: Math.max(0, medicine.quantity - item.quantity),
      };
      updateMedicine(updatedMedicine);
    }
  });
  
  return newSale;
};

export const updateSale = (sale: Sale): Sale => {
  const sales = getSales();
  const updatedSales = sales.map(s => s.id === sale.id ? sale : s);
  localStorage.setItem('sales', JSON.stringify(updatedSales));
  return sale;
};

export const deleteSale = (id: string): boolean => {
  const sales = getSales();
  const filteredSales = sales.filter(sale => sale.id !== id);
  
  if (filteredSales.length === sales.length) {
    return false;
  }
  
  localStorage.setItem('sales', JSON.stringify(filteredSales));
  return true;
};

// Alert related functions
export const getAlerts = (): Alert[] => {
  const alerts = localStorage.getItem('alerts');
  return alerts ? JSON.parse(alerts) : [];
};

export const getUnreadAlerts = (): Alert[] => {
  const alerts = getAlerts();
  return alerts.filter(alert => !alert.isRead);
};

export const addAlert = (alert: Omit<Alert, 'id' | 'createdAt'>): Alert => {
  const newAlert: Alert = {
    ...alert,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };
  
  const alerts = getAlerts();
  localStorage.setItem('alerts', JSON.stringify([...alerts, newAlert]));
  return newAlert;
};

export const markAlertAsRead = (id: string): boolean => {
  const alerts = getAlerts();
  const updatedAlerts = alerts.map(alert => 
    alert.id === id ? { ...alert, isRead: true } : alert
  );
  
  localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  return true;
};

export const markAllAlertsAsRead = (): boolean => {
  const alerts = getAlerts();
  const updatedAlerts = alerts.map(alert => ({ ...alert, isRead: true }));
  
  localStorage.setItem('alerts', JSON.stringify(updatedAlerts));
  return true;
};

export const deleteAlert = (id: string): boolean => {
  const alerts = getAlerts();
  const filteredAlerts = alerts.filter(alert => alert.id !== id);
  
  if (filteredAlerts.length === alerts.length) {
    return false;
  }
  
  localStorage.setItem('alerts', JSON.stringify(filteredAlerts));
  return true;
};

// Helper functions
export const checkAndCreateAlerts = (medicine: Medicine): void => {
  // Check for low stock
  if (medicine.quantity <= medicine.minStockLevel) {
    addAlert({
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${medicine.name} (${medicine.batchNumber}) is running low on stock. Current quantity: ${medicine.quantity}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      isRead: false,
    });
  }
  
  // Check for expiry (within 30 days)
  const expiryDate = new Date(medicine.expiryDate);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  if (expiryDate <= thirtyDaysFromNow && expiryDate > today) {
    addAlert({
      type: 'expiry',
      title: 'Expiry Alert',
      message: `${medicine.name} (${medicine.batchNumber}) will expire on ${new Date(medicine.expiryDate).toLocaleDateString()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      isRead: false,
    });
  }
  
  // Check for expired medicines
  if (expiryDate <= today) {
    addAlert({
      type: 'expiry',
      title: 'Expired Medicine',
      message: `${medicine.name} (${medicine.batchNumber}) has expired on ${new Date(medicine.expiryDate).toLocaleDateString()}`,
      medicineId: medicine.id,
      medicineName: medicine.name,
      isRead: false,
    });
  }
};

export const getDashboardStats = (): DashboardStats => {
  const medicines = getMedicines();
  const sales = getSales();
  const purchaseOrders = getPurchaseOrders();
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  
  // Count low stock medicines
  const lowStockCount = medicines.filter(m => m.quantity <= m.minStockLevel).length;
  
  // Count expiring medicines (within 30 days)
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  
  const expiringCount = medicines.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    return expiryDate <= thirtyDaysFromNow && expiryDate > today;
  }).length;
  
  // Count expired medicines
  const expiredCount = medicines.filter(m => {
    const expiryDate = new Date(m.expiryDate);
    return expiryDate <= today;
  }).length;
  
  // Calculate today's sales
  const todaySales = sales
    .filter(s => new Date(s.saleDate) >= today)
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Calculate monthly sales
  const monthlySales = sales
    .filter(s => new Date(s.saleDate) >= firstDayOfMonth)
    .reduce((sum, sale) => sum + sale.total, 0);
  
  // Count pending orders
  const pendingOrders = purchaseOrders.filter(po => po.status === 'pending' || po.status === 'ordered').length;
  
  return {
    totalMedicines: medicines.length,
    lowStockCount,
    expiringCount,
    expiredCount,
    todaySales,
    monthlySales,
    pendingOrders,
  };
};

// Generate sample data for testing
export const generateSampleData = () => {
  // Sample categories
  const categories = ['Tablet', 'Syrup', 'Injection', 'Capsule', 'Cream', 'Drops', 'Powder'];
  
  // Sample manufacturers
  const manufacturers = ['Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Lupin', 'Zydus Cadila', 'Mankind', 'Alkem'];
  
  // Sample medicine names
  const medicineNames = [
    'Paracetamol', 'Amoxicillin', 'Azithromycin', 'Cetirizine', 
    'Diclofenac', 'Metformin', 'Omeprazole', 'Pantoprazole',
    'Atorvastatin', 'Losartan', 'Amlodipine', 'Aspirin',
    'Ibuprofen', 'Ranitidine', 'Domperidone', 'Ondansetron'
  ];
  
  // Sample suppliers
  const supplierNames = [
    'MediSupply Inc.', 'PharmaDistributors', 'HealthCare Supplies',
    'MediWholesale Ltd.', 'National Medical Distributors'
  ];
  
  // Generate random medicines
  const medicines: Omit<Medicine, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  
  for (let i = 0; i < 20; i++) {
    const name = medicineNames[Math.floor(Math.random() * medicineNames.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const manufacturer = manufacturers[Math.floor(Math.random() * manufacturers.length)];
    
    // Generate random dates
    const today = new Date();
    const manufactureDate = new Date();
    manufactureDate.setMonth(today.getMonth() - Math.floor(Math.random() * 12));
    
    const expiryDate = new Date(manufactureDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 2 + Math.floor(Math.random() * 2));
    
    const purchasePrice = 10 + Math.floor(Math.random() * 490);
    const sellingPrice = purchasePrice * (1 + (0.1 + Math.random() * 0.5));
    
    const quantity = Math.floor(Math.random() * 100);
    const minStockLevel = 10 + Math.floor(Math.random() * 20);
    
    medicines.push({
      name,
      description: `${name} ${category} by ${manufacturer}`,
      category,
      manufacturer,
      batchNumber: `B${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      barcode: `MED${Math.floor(Math.random() * 1000000).toString().padStart(7, '0')}`,
      purchasePrice,
      sellingPrice,
      quantity,
      minStockLevel,
      manufactureDate: manufactureDate.toISOString(),
      expiryDate: expiryDate.toISOString(),
      location: `Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}-${Math.floor(Math.random() * 10) + 1}`,
    });
  }
  
  // Generate suppliers
  const suppliers: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>[] = [];
  
  for (let i = 0; i < supplierNames.length; i++) {
    suppliers.push({
      name: supplierNames[i],
      contactPerson: `Contact Person ${i + 1}`,
      email: `supplier${i + 1}@example.com`,
      phone: `+91${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}`,
      address: `Address Line ${i + 1}, City ${i + 1}, State ${i + 1}`,
      gstNumber: `GST${Math.floor(Math.random() * 1000000000).toString().padStart(10, '0')}`,
      paymentTerms: `Net ${[15, 30, 45, 60][Math.floor(Math.random() * 4)]} days`,
    });
  }
  
  // Add sample data to localStorage
  medicines.forEach(medicine => addMedicine(medicine));
  suppliers.forEach(supplier => addSupplier(supplier));
  
  // Generate purchase orders
  const generatedMedicines = getMedicines();
  const generatedSuppliers = getSuppliers();
  
  for (let i = 0; i < 5; i++) {
    const supplier = generatedSuppliers[Math.floor(Math.random() * generatedSuppliers.length)];
    const orderItems: PurchaseOrderItem[] = [];
    
    // Add 2-5 items to each order
    const itemCount = 2 + Math.floor(Math.random() * 4);
    let totalAmount = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const medicine = generatedMedicines[Math.floor(Math.random() * generatedMedicines.length)];
      const quantity = 10 + Math.floor(Math.random() * 50);
      const unitPrice = medicine.purchasePrice;
      const totalPrice = quantity * unitPrice;
      
      totalAmount += totalPrice;
      
      orderItems.push({
        id: uuidv4(),
        medicineId: medicine.id,
        medicineName: medicine.name,
        quantity,
        unitPrice,
        totalPrice,
      });
    }
    
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30));
    
    const expectedDeliveryDate = new Date(orderDate);
    expectedDeliveryDate.setDate(orderDate.getDate() + 7 + Math.floor(Math.random() * 7));
    
    const status = ['pending', 'ordered', 'received'][Math.floor(Math.random() * 3)] as 'pending' | 'ordered' | 'received';
    
    let receivedDate = undefined;
    if (status === 'received') {
      receivedDate = new Date(expectedDeliveryDate);
      receivedDate.setDate(expectedDeliveryDate.getDate() - 2 + Math.floor(Math.random() * 5));
    }
    
    addPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      status,
      orderDate: orderDate.toISOString(),
      expectedDeliveryDate: expectedDeliveryDate.toISOString(),
      receivedDate: receivedDate?.toISOString(),
      totalAmount,
      paymentStatus: ['unpaid', 'partial', 'paid'][Math.floor(Math.random() * 3)] as 'unpaid' | 'partial' | 'paid',
      items: orderItems,
      notes: `Sample purchase order ${i + 1}`,
    });
  }
  
  // Generate sales
  for (let i = 0; i < 10; i++) {
    const saleItems: SaleItem[] = [];
    
    // Add 1-3 items to each sale
    const itemCount = 1 + Math.floor(Math.random() * 3);
    let subtotal = 0;
    
    for (let j = 0; j < itemCount; j++) {
      const medicine = generatedMedicines[Math.floor(Math.random() * generatedMedicines.length)];
      const quantity = 1 + Math.floor(Math.random() * 5);
      const unitPrice = medicine.sellingPrice;
      const discount = Math.random() < 0.3 ? Math.floor(unitPrice * 0.05 * 100) / 100 : 0;
      const totalPrice = (unitPrice - discount) * quantity;
      
      subtotal += totalPrice;
      
      saleItems.push({
        id: uuidv4(),
        medicineId: medicine.id,
        medicineName: medicine.name,
        batchNumber: medicine.batchNumber,
        expiryDate: medicine.expiryDate,
        quantity,
        unitPrice,
        discount,
        totalPrice,
      });
    }
    
    const discount = Math.random() < 0.2 ? Math.floor(subtotal * 0.05 * 100) / 100 : 0;
    const tax = Math.floor(subtotal * 0.18 * 100) / 100; // 18% GST
    const total = subtotal - discount + tax;
    
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - Math.floor(Math.random() * 30));
    
    addSale({
      customerName: Math.random() < 0.7 ? `Customer ${i + 1}` : undefined,
      customerPhone: Math.random() < 0.5 ? `+91${Math.floor(Math.random() * 10000000000).toString().padStart(10, '0')}` : undefined,
      items: saleItems,
      subtotal,
      discount,
      tax,
      total,
      paymentMethod: ['cash', 'card', 'upi'][Math.floor(Math.random() * 3)] as 'cash' | 'card' | 'upi',
      paymentStatus: 'paid',
      saleDate: saleDate.toISOString(),
      createdBy: defaultAdmin.id,
    });
  }
};