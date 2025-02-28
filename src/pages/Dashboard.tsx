import React, { useState, useEffect } from 'react';
import { 
  Package, 
  AlertTriangle, 
  Clock, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  Truck,
  Pill
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Card from '../components/ui/Card';
import { 
  getMedicines, 
  getSuppliers, 
  getPurchaseOrders, 
  getSales,
  getDashboardStats
} from '../utils/localStorage';
import { formatCurrency, daysUntilExpiry } from '../utils/helpers';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState(getDashboardStats());
  const [lowStockMedicines, setLowStockMedicines] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const [recentSales, setRecentSales] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    // Get low stock medicines
    const medicines = getMedicines();
    setLowStockMedicines(
      medicines
        .filter(m => m.quantity <= m.minStockLevel)
        .sort((a, b) => a.quantity - b.quantity)
        .slice(0, 5)
    );

    // Get expiring medicines (within 30 days)
    const today = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(today.getDate() + 30);

    setExpiringMedicines(
      medicines
        .filter(m => {
          const expiryDate = new Date(m.expiryDate);
          return expiryDate <= thirtyDaysFromNow && expiryDate > today;
        })
        .sort((a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime())
        .slice(0, 5)
    );

    // Get recent sales
    const sales = getSales();
    setRecentSales(
      sales
        .sort((a, b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime())
        .slice(0, 5)
    );

    // Get pending orders
    const orders = getPurchaseOrders();
    setPendingOrders(
      orders
        .filter(o => o.status === 'pending' || o.status === 'ordered')
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 5)
    );
  }, []);

  // Prepare data for sales chart
  const prepareSalesChartData = () => {
    const sales = getSales();
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      return date;
    }).reverse();

    const labels = last7Days.map(date => date.toLocaleDateString('en-US', { weekday: 'short' }));
    const data = last7Days.map(date => {
      const nextDay = new Date(date);
      nextDay.setDate(date.getDate() + 1);
      
      return sales
        .filter(sale => {
          const saleDate = new Date(sale.saleDate);
          return saleDate >= date && saleDate < nextDay;
        })
        .reduce((sum, sale) => sum + sale.total, 0);
    });

    return {
      labels,
      datasets: [
        {
          label: 'Sales',
          data,
          backgroundColor: 'rgba(59, 130, 246, 0.5)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 1,
        },
      ],
    };
  };

  // Prepare data for category chart
  const prepareCategoryChartData = () => {
    const medicines = getMedicines();
    const categories = {};
    
    medicines.forEach(medicine => {
      if (categories[medicine.category]) {
        categories[medicine.category]++;
      } else {
        categories[medicine.category] = 1;
      }
    });

    return {
      labels: Object.keys(categories),
      datasets: [
        {
          data: Object.values(categories),
          backgroundColor: [
            'rgba(59, 130, 246, 0.6)',
            'rgba(16, 185, 129, 0.6)',
            'rgba(245, 158, 11, 0.6)',
            'rgba(239, 68, 68, 0.6)',
            'rgba(139, 92, 246, 0.6)',
            'rgba(236, 72, 153, 0.6)',
            'rgba(75, 85, 99, 0.6)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <Header title="Dashboard" subtitle="Overview of your inventory and sales" />
      
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-blue-50 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-500 text-white mr-4">
                <Pill size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-500">Total Medicines</p>
                <p className="text-2xl font-semibold">{stats.totalMedicines}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-yellow-50 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-500 text-white mr-4">
                <AlertTriangle size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-yellow-500">Low Stock Items</p>
                <p className="text-2xl font-semibold">{stats.lowStockCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-red-50 border-l-4 border-red-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-500 text-white mr-4">
                <Clock size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-red-500">Expiring Soon</p>
                <p className="text-2xl font-semibold">{stats.expiringCount}</p>
              </div>
            </div>
          </Card>
          
          <Card className="bg-green-50 border-l-4 border-green-500">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-500 text-white mr-4">
                <ShoppingCart size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-green-500">Today's Sales</p>
                <p className="text-2xl font-semibold">{formatCurrency(stats.todaySales)}</p>
              </div>
            </div>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card title="Sales Last 7 Days">
            <div className="h-64">
              <Bar 
                data={prepareSalesChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    title: {
                      display: false,
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                    },
                  },
                }}
              />
            </div>
          </Card>
          
          <Card title="Medicines by Category">
            <div className="h-64 flex items-center justify-center">
              <Doughnut 
                data={prepareCategoryChartData()} 
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                    },
                  },
                }}
              />
            </div>
          </Card>
        </div>
        
        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Low Stock Medicines" footer={
            <Link to="/medicines" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all low stock medicines
            </Link>
          }>
            {lowStockMedicines.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {lowStockMedicines.map(medicine => (
                  <li key={medicine.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-gray-500">{medicine.category} | {medicine.manufacturer}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${medicine.quantity <= 0 ? 'text-red-600' : 'text-yellow-600'}`}>
                          {medicine.quantity} in stock
                        </p>
                        <p className="text-sm text-gray-500">Min: {medicine.minStockLevel}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4 text-center">No low stock medicines</p>
            )}
          </Card>
          
          <Card title="Expiring Soon" footer={
            <Link to="/medicines" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all expiring medicines
            </Link>
          }>
            {expiringMedicines.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {expiringMedicines.map(medicine => (
                  <li key={medicine.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-gray-500">Batch: {medicine.batchNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-orange-600">
                          Expires in {daysUntilExpiry(medicine.expiryDate)} days
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(medicine.expiryDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4 text-center">No medicines expiring soon</p>
            )}
          </Card>
          
          <Card title="Recent Sales" footer={
            <Link to="/sales" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all sales
            </Link>
          }>
            {recentSales.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {recentSales.map(sale => (
                  <li key={sale.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{sale.invoiceNumber}</p>
                        <p className="text-sm text-gray-500">
                          {sale.customerName || 'Walk-in Customer'} | {new Date(sale.saleDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-green-600">{formatCurrency(sale.total)}</p>
                        <p className="text-sm text-gray-500">{sale.items.length} items</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4 text-center">No recent sales</p>
            )}
          </Card>
          
          <Card title="Pending Orders" footer={
            <Link to="/purchase-orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View all purchase orders
            </Link>
          }>
            {pendingOrders.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {pendingOrders.map(order => (
                  <li key={order.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{order.orderNumber}</p>
                        <p className="text-sm text-gray-500">
                          {order.supplierName} | {new Date(order.orderDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-sm text-gray-500 capitalize">{order.status}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 py-4 text-center">No pending orders</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;