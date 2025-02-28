import { format, parseISO } from 'date-fns';

// Format date to display in UI
export const formatDate = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch (error) {
    return 'Invalid date';
  }
};

// Format date with time
export const formatDateTime = (dateString: string): string => {
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
  } catch (error) {
    return 'Invalid date';
  }
};

// Format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Calculate days until expiry
export const daysUntilExpiry = (expiryDateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expiryDate = new Date(expiryDateString);
  expiryDate.setHours(0, 0, 0, 0);
  
  const diffTime = expiryDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Get expiry status class
export const getExpiryStatusClass = (expiryDateString: string): string => {
  const days = daysUntilExpiry(expiryDateString);
  
  if (days < 0) {
    return 'text-red-600 font-bold';
  } else if (days <= 30) {
    return 'text-orange-500 font-bold';
  } else if (days <= 90) {
    return 'text-yellow-500';
  } else {
    return 'text-green-600';
  }
};

// Get stock status class
export const getStockStatusClass = (quantity: number, minStockLevel: number): string => {
  if (quantity <= 0) {
    return 'text-red-600 font-bold';
  } else if (quantity <= minStockLevel) {
    return 'text-orange-500 font-bold';
  } else {
    return 'text-green-600';
  }
};

// Generate a random color for charts
export const getRandomColor = (): string => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// Generate a set of colors for charts
export const generateChartColors = (count: number): string[] => {
  const predefinedColors = [
    '#4299E1', // blue-500
    '#48BB78', // green-500
    '#ED8936', // orange-500
    '#9F7AEA', // purple-500
    '#F56565', // red-500
    '#38B2AC', // teal-500
    '#ECC94B', // yellow-500
    '#667EEA', // indigo-500
    '#ED64A6', // pink-500
    '#A0AEC0', // gray-500
  ];
  
  if (count <= predefinedColors.length) {
    return predefinedColors.slice(0, count);
  }
  
  const colors = [...predefinedColors];
  for (let i = predefinedColors.length; i < count; i++) {
    colors.push(getRandomColor());
  }
  
  return colors;
};

// Filter function for search
export const filterItems = <T>(items: T[], searchTerm: string, fields: (keyof T)[]): T[] => {
  if (!searchTerm.trim()) {
    return items;
  }
  
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  
  return items.filter(item => {
    return fields.some(field => {
      const value = item[field];
      if (value === null || value === undefined) {
        return false;
      }
      return String(value).toLowerCase().includes(lowerCaseSearchTerm);
    });
  });
};

// Sort function for tables
export const sortItems = <T>(
  items: T[],
  sortField: keyof T | null,
  sortDirection: 'asc' | 'desc' | null
): T[] => {
  if (!sortField || !sortDirection) {
    return items;
  }
  
  return [...items].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];
    
    if (valueA === valueB) {
      return 0;
    }
    
    if (valueA === null || valueA === undefined) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    
    if (valueB === null || valueB === undefined) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDirection === 'asc'
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    }
    
    return sortDirection === 'asc'
      ? (valueA < valueB ? -1 : 1)
      : (valueA < valueB ? 1 : -1);
  });
};

// Pagination function
export const paginateItems = <T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): T[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
};

// Calculate total pages
export const calculateTotalPages = (totalItems: number, itemsPerPage: number): number => {
  return Math.ceil(totalItems / itemsPerPage);
};

// Generate pagination range
export const generatePaginationRange = (
  currentPage: number,
  totalPages: number,
  maxPageButtons = 5
): (number | '...')[] => {
  if (totalPages <= maxPageButtons) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  
  const halfMaxButtons = Math.floor(maxPageButtons / 2);
  let startPage = Math.max(currentPage - halfMaxButtons, 1);
  let endPage = Math.min(startPage + maxPageButtons - 1, totalPages);
  
  if (endPage - startPage + 1 < maxPageButtons) {
    startPage = Math.max(endPage - maxPageButtons + 1, 1);
  }
  
  const pages: (number | '...')[] = [];
  
  if (startPage > 1) {
    pages.push(1);
    if (startPage > 2) {
      pages.push('...');
    }
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      pages.push('...');
    }
    pages.push(totalPages);
  }
  
  return pages;
};