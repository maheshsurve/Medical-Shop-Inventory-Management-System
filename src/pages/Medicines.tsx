import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash, AlertTriangle, BarChart2 } from 'lucide-react';
import Header from '../components/layout/Header';
import Button from '../components/ui/Button';
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeader, Pagination } from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import { getMedicines, addMedicine, updateMedicine, deleteMedicine } from '../utils/localStorage';
import { formatDate, formatCurrency, getExpiryStatusClass, getStockStatusClass, filterItems, sortItems, paginateItems, calculateTotalPages } from '../utils/helpers';
import { Medicine } from '../types';
import { useAuth } from '../context/AuthContext';

const Medicines: React.FC = () => {
  const { isManager } = useAuth();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [filteredMedicines, setFilteredMedicines] = useState<Medicine[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    manufacturer: '',
    batchNumber: '',
    barcode: '',
    purchasePrice: 0,
    sellingPrice: 0,
    quantity: 0,
    minStockLevel: 0,
    manufactureDate: '',
    expiryDate: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Medicine | null>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>('asc');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState('');
  const [filterExpiry, setFilterExpiry] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  useEffect(() => {
    loadMedicines();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [medicines, searchTerm, filterCategory, filterStock, filterExpiry]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredMedicines]);

  const loadMedicines = () => {
    const allMedicines = getMedicines();
    setMedicines(allMedicines);
    setFilteredMedicines(allMedicines);
  };

  const applyFilters = () => {
    let filtered = medicines;

    // Apply search filter
    if (searchTerm) {
      filtered = filterItems(filtered, searchTerm, ['name', 'description', 'manufacturer', 'batchNumber', 'barcode']);
    }

    // Apply category filter
    if (filterCategory) {
      filtered = filtered.filter(medicine => medicine.category === filterCategory);
    }

    // Apply stock filter
    if (filterStock) {
      switch (filterStock) {
        case 'low':
          filtered = filtered.filter(medicine => medicine.quantity <= medicine.minStockLevel && medicine.quantity > 0);
          break;
        case 'out':
          filtered = filtered.filter(medicine => medicine.quantity <= 0);
          break;
        case 'normal':
          filtered = filtered.filter(medicine => medicine.quantity > medicine.minStockLevel);
          break;
      }
    }

    // Apply expiry filter
    if (filterExpiry) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);
      
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(today.getDate() + 90);
      
      switch (filterExpiry) {
        case 'expired':
          filtered = filtered.filter(medicine => new Date(medicine.expiryDate) < today);
          break;
        case '30days':
          filtered = filtered.filter(medicine => {
            const expiryDate = new Date(medicine.expiryDate);
            return expiryDate >= today && expiryDate <= thirtyDaysFromNow;
          });
          break;
        case '90days':
          filtered = filtered.filter(medicine => {
            const expiryDate = new Date(medicine.expiryDate);
            return expiryDate > thirtyDaysFromNow && expiryDate <= ninetyDaysFromNow;
          });
          break;
        case 'valid':
          filtered = filtered.filter(medicine => new Date(medicine.expiryDate) > ninetyDaysFromNow);
          break;
      }
    }

    // Apply sorting
    if (sortField && sortDirection) {
      filtered = sortItems(filtered, sortField, sortDirection);
    }

    setFilteredMedicines(filtered);
  };

  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc');
      if (sortDirection === 'desc') {
        setSortField(null);
      }
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleAddMedicine = () => {
    if (validateForm()) {
      const newMedicine = addMedicine({
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        minStockLevel: Number(formData.minStockLevel),
      });
      
      setMedicines([...medicines, newMedicine]);
      resetForm();
      setIsAddModalOpen(false);
    }
  };

  const handleEditMedicine = () => {
    if (validateForm() && selectedMedicine) {
      const updatedMedicine = updateMedicine({
        ...selectedMedicine,
        ...formData,
        purchasePrice: Number(formData.purchasePrice),
        sellingPrice: Number(formData.sellingPrice),
        quantity: Number(formData.quantity),
        minStockLevel: Number(formData.minStockLevel),
      });
      
      setMedicines(medicines.map(m => m.id === updatedMedicine.id ? updatedMedicine : m));
      resetForm();
      setIsEditModalOpen(false);
    }
  };

  const handleDeleteMedicine = () => {
    if (selectedMedicine) {
      deleteMedicine(selectedMedicine.id);
      setMedicines(medicines.filter(m => m.id !== selectedMedicine.id));
      setIsDeleteModalOpen(false);
    }
  };

  const openEditModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setFormData({
      name: medicine.name,
      description: medicine.description || '',
      category: medicine.category,
      manufacturer: medicine.manufacturer,
      batchNumber: medicine.batchNumber,
      barcode: medicine.barcode || '',
      purchasePrice: medicine.purchasePrice,
      sellingPrice: medicine.sellingPrice,
      quantity: medicine.quantity,
      minStockLevel: medicine.minStockLevel,
      manufactureDate: medicine.manufactureDate.split('T')[0],
      expiryDate: medicine.expiryDate.split('T')[0],
      location: medicine.location || '',
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (medicine: Medicine) => {
    setSelectedMedicine(medicine);
    setIsDeleteModalOpen(true);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.manufacturer.trim()) {
      newErrors.manufacturer = 'Manufacturer is required';
    }
    
    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = 'Batch number is required';
    }
    
    if (formData.purchasePrice <= 0) {
      newErrors.purchasePrice = 'Purchase price must be greater than 0';
    }
    
    if (formData.sellingPrice <= 0) {
      newErrors.sellingPrice = 'Selling price must be greater than 0';
    }
    
    if (formData.sellingPrice < formData.purchasePrice) {
      newErrors.sellingPrice = 'Selling price should be greater than purchase price';
    }
    
    if (formData.quantity < 0) {
      newErrors.quantity = 'Quantity cannot be negative';
    }
    
    if (formData.minStockLevel < 0) {
      newErrors.minStockLevel = 'Minimum stock level cannot be negative';
    }
    
    if (!formData.manufactureDate) {
      newErrors.manufactureDate = 'Manufacture date is required';
    }
    
    if (!formData.expiryDate) {
      newErrors.expiryDate = 'Expiry date is required';
    }
    
    if (formData.manufactureDate && formData.expiryDate && new Date(formData.manufactureDate) >= new Date(formData.expiryDate)) {
      newErrors.expiryDate = 'Expiry date must be after manufacture date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      manufacturer: '',
      batchNumber: '',
      barcode: '',
      purchasePrice: 0,
      sellingPrice: 0,
      quantity: 0,
      minStockLevel: 0,
      manufactureDate: '',
      expiryDate: '',
      location: '',
    });
    setErrors({});
    setSelectedMedicine(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const resetFilters = () => {
    setFilterCategory('');
    setFilterStock('');
    setFilterExpiry('');
    setIsFilterModalOpen(false);
  };

  // Get unique categories for filter dropdown
  const categories = [...new Set(medicines.map(m => m.category))].sort();

  // Pagination
  const totalPages = calculateTotalPages(filteredMedicines.length, itemsPerPage);
  const currentItems = paginateItems(filteredMedicines, currentPage, itemsPerPage);

  return (
    <div className="flex-1 overflow-y-auto">
      <Header 
        title="Medicines" 
        subtitle="Manage your medicine inventory"
        onSearch={handleSearch}
        searchPlaceholder="Search medicines..."
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              icon={<Filter size={16} />}
              onClick={() => setIsFilterModalOpen(true)}
              className="mr-2"
            >
              Filter
            </Button>
            {isManager && (
              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
              >
                Add Medicine
              </Button>
            )}
          </>
        }
      />
      
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader 
                  sortable 
                  sorted={sortField === 'name' ? sortDirection : null}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableHeader>
                <TableHeader 
                  sortable 
                  sorted={sortField === 'category' ? sortDirection : null}
                  onClick={() => handleSort('category')}
                >
                  Category
                </TableHeader>
                <TableHeader>Manufacturer</TableHeader>
                <TableHeader>Batch No.</TableHeader>
                <TableHeader 
                  sortable 
                  sorted={sortField === 'quantity' ? sortDirection : null}
                  onClick={() => handleSort('quantity')}
                >
                  Stock
                </TableHeader>
                <TableHeader 
                  sortable 
                  sorted={sortField === 'sellingPrice' ? sortDirection : null}
                  onClick={() => handleSort('sellingPrice')}
                >
                  Price
                </TableHeader>
                <TableHeader 
                  sortable 
                  sorted={sortField === 'expiryDate' ? sortDirection : null}
                  onClick={() => handleSort('expiryDate')}
                >
                  Expiry Date
                </TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((medicine) => (
                  <TableRow key={medicine.id}>
                    <TableCell className="font-medium">{medicine.name}</TableCell>
                    <TableCell>{medicine.category}</TableCell>
                    <TableCell>{medicine.manufacturer}</TableCell>
                    <TableCell>{medicine.batchNumber}</TableCell>
                    <TableCell className={getStockStatusClass(medicine.quantity, medicine.minStockLevel)}>
                      {medicine.quantity}
                      {medicine.quantity <= medicine.minStockLevel && (
                        <AlertTriangle className="inline-block ml-1 h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{formatCurrency(medicine.sellingPrice)}</TableCell>
                    <TableCell className={getExpiryStatusClass(medicine.expiryDate)}>
                      {formatDate(medicine.expiryDate)}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Edit size={16} />}
                          onClick={() => openEditModal(medicine)}
                        >
                          Edit
                        </Button>
                        {isManager && (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash size={16} />}
                            onClick={() => openDeleteModal(medicine)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    No medicines found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
      
      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Medicine"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleAddMedicine}>
              Add Medicine
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Medicine Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />
          
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={[
              { value: 'Tablet', label: 'Tablet' },
              { value: 'Capsule', label: 'Capsule' },
              { value: 'Syrup', label: 'Syrup' },
              { value: 'Injection', label: 'Injection' },
              { value: 'Cream', label: 'Cream' },
              { value: 'Ointment', label: 'Ointment' },
              { value: 'Drops', label: 'Drops' },
              { value: 'Powder', label: 'Powder' },
              { value: 'Inhaler', label: 'Inhaler' },
              { value: 'Other', label: 'Other' },
            ]}
            error={errors.category}
            required
          />
          
          <Input
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            error={errors.manufacturer}
            required
          />
          
          <Input
            label="Batch Number"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleInputChange}
            error={errors.batchNumber}
            required
          />
          
          <Input
            label="Barcode (Optional)"
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
          />
          
          <Input
            label="Location (Optional)"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Shelf A-3"
          />
          
          <Input
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.purchasePrice}
            onChange={handleInputChange}
            error={errors.purchasePrice}
            required
          />
          
          <Input
            label="Selling Price"
            name="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice}
            onChange={handleInputChange}
            error={errors.sellingPrice}
            required
          />
          
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleInputChange}
            error={errors.quantity}
            required
          />
          
          <Input
            label="Minimum Stock Level"
            name="minStockLevel"
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={handleInputChange}
            error={errors.minStockLevel}
            required
          />
          
          <Input
            label="Manufacture Date"
            name="manufactureDate"
            type="date"
            value={formData.manufactureDate}
            onChange={handleInputChange}
            error={errors.manufactureDate}
            required
          />
          
          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleInputChange}
            error={errors.expiryDate}
            required
          />
          
          <div className="md:col-span-2">
            <Input
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>
      
      {/* Edit Medicine Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Medicine"
        size="lg"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEditMedicine}>
              Update Medicine
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Medicine Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
          />
          
          <Select
            label="Category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            options={[
              { value: 'Tablet', label: 'Tablet' },
              { value: 'Capsule', label: 'Capsule' },
              { value: 'Syrup', label: 'Syrup' },
              { value: 'Injection', label: 'Injection' },
              { value: 'Cream', label: 'Cream' },
              { value: 'Ointment', label: 'Ointment' },
              { value: 'Drops', label: 'Drops' },
              { value: 'Powder', label: 'Powder' },
              { value: 'Inhaler', label: 'Inhaler' },
              { value: 'Other', label: 'Other' },
            ]}
            error={errors.category}
            required
          />
          
          <Input
            label="Manufacturer"
            name="manufacturer"
            value={formData.manufacturer}
            onChange={handleInputChange}
            error={errors.manufacturer}
            required
          />
          
          <Input
            label="Batch Number"
            name="batchNumber"
            value={formData.batchNumber}
            onChange={handleInputChange}
            error={errors.batchNumber}
            required
          />
          
          <Input
            label="Barcode (Optional)"
            name="barcode"
            value={formData.barcode}
            onChange={handleInputChange}
          />
          
          <Input
            label="Location (Optional)"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            placeholder="e.g., Shelf A-3"
          />
          
          <Input
            label="Purchase Price"
            name="purchasePrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.purchasePrice}
            onChange={handleInputChange}
            error={errors.purchasePrice}
            required
          />
          
          <Input
            label="Selling Price"
            name="sellingPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.sellingPrice}
            onChange={handleInputChange}
            error={errors.sellingPrice}
            required
          />
          
          <Input
            label="Quantity"
            name="quantity"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={handleInputChange}
            error={errors.quantity}
            required
          />
          
          <Input
            label="Minimum Stock Level"
            name="minStockLevel"
            type="number"
            min="0"
            value={formData.minStockLevel}
            onChange={handleInputChange}
            error={errors.minStockLevel}
            required
          />
          
          <Input
            label="Manufacture Date"
            name="manufactureDate"
            type="date"
            value={formData.manufactureDate}
            onChange={handleInputChange}
            error={errors.manufactureDate}
            required
          />
          
          <Input
            label="Expiry Date"
            name="expiryDate"
            type="date"
            value={formData.expiryDate}
            onChange={handleInputChange}
            error={errors.expiryDate}
            required
          />
          
          <div className="md:col-span-2">
            <Input
              label="Description (Optional)"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Medicine"
        size="sm"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteMedicine}>
              Delete
            </Button>
          </div>
        }
      >
        <p>
          Are you sure you want to delete <strong>{selectedMedicine?.name}</strong>? This action cannot be undone.
        </p>
      </Modal>
      
      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Medicines"
        size="md"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={resetFilters}>
              Reset Filters
            </Button>
            <Button variant="primary" onClick={() => setIsFilterModalOpen(false)}>
              Apply Filters
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Select
            label="Category"
            name="filterCategory"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={categories.map(category => ({ value: category, label: category }))}
          />
          
          <Select
            label="Stock Status"
            name="filterStock"
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value)}
            options={[
              { value: '', label: 'All' },
              { value: 'low', label: 'Low Stock' },
              { value: 'out', label: 'Out of Stock' },
              { value: 'normal', label: 'Normal Stock' },
            ]}
          />
          
          <Select
            label="Expiry Status"
            name="filterExpiry"
            value={filterExpiry}
            onChange={(e) => setFilterExpiry(e.target.value)}
            options={[
              { value: '', label: 'All' },
              { value: 'expired', label: 'Expired' },
              { value: '30days', label: 'Expiring in 30 days' },
              { value: '90days', label: 'Expiring in 31-90 days' },
              { value: 'valid', label: 'Valid (> 90 days)' },
            ]}
          />
        </div>
      </Modal>
    </div>
  );
};

export default Medicines;