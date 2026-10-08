import React from 'react';
import {
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Users,
  Star,
  Package,
  ArrowUpRight,
  Sparkles
} from 'lucide-react';
import { Product, Order, Customer, Review } from '../../types';

interface AdminDashboardTabProps {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  reviews: Review[];
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  products,
  orders,
  customers,
  reviews,
  onNavigateTab
}) => {
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === 'paid' ? o.total : 0), 0);
  const pendingOrders = orders.filter((o) => o.fulfillmentStatus === 'unfulfilled');
  const avgOrderValue = orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : '0';

  const stats = [
    {
      title: "Total Net Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      change: "+24.8% vs last month",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10"
    },
    {
      title: "Store Orders",
      value: orders.length.toString(),
      change: `${pendingOrders.length} unfulfilled`,
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    },
    {
      title: "Verified Customers",
      value: customers.length.toString(),
      change: "100% repeat intent",
      icon: Users,
      color: "text-purple-500",
      bg: "bg-purple-500/10"
    },
    {
      title: "Avg Order Value",
      value: `$${avgOrderValue}`,
      change: "High-ticket Seoul curations",
      icon: TrendingUp,
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 sm:p-8 bg-stone-900 text-white rounded-3xl border border-stone-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Store Owner Central</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Li Fei Beauty Overview</h2>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Real-time shop health, order fulfillment pipeline, customer reviews, and live product catalog.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => onNavigateTab('customize')}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
          >
            Customize Storefront
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all border border-stone-700 cursor-pointer"
          >
            Manage Products
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-stone-900 tracking-tight mb-1">
              {stat.value}
            </div>
            <p className="text-xs font-medium text-stone-500 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />
              <span>{stat.change}</span>
            </p>
          </div>
        ))}
      </div>

      {/* Two Column Section: Recent Orders & Top Formulations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Recent Customer Orders</h3>
              <p className="text-xs text-stone-400">Incoming dispatch requests from Seoul</p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              View All Orders →
            </button>
          </div>

          <div className="divide-y divide-stone-100">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="py-3.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{order.orderNumber}</span>
                    <span className="text-stone-400">· {order.customer.name}</span>
                  </div>
                  <p className="text-stone-500 text-[11px] mt-0.5">
                    {order.items.length} item(s) · {order.date}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold text-stone-900">${order.total.toFixed(2)}</div>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      order.fulfillmentStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : order.fulfillmentStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {order.fulfillmentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Product Formulas */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-stone-900 text-base">Top Formulations</h3>
              <p className="text-xs text-stone-400">Highest rated & customer velocity</p>
            </div>
            <button
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
            >
              Products ({products.length}) →
            </button>
          </div>

          <div className="space-y-3.5">
            {products.slice(0, 4).map((product) => (
              <div key={product.id} className="flex items-center gap-3.5 p-2 rounded-xl hover:bg-stone-50">
                <div
                  className="w-12 h-12 rounded-xl p-1.5 flex items-center justify-center shrink-0 border border-stone-200"
                  style={{ backgroundColor: product.panel || '#FAF5F7' }}
                >
                  {product.src ? (
                    <img src={product.src} alt={product.name} className="max-h-full w-auto object-contain" />
                  ) : (
                    <Package className="w-5 h-5 text-stone-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-xs truncate">{product.name}</h4>
                  <p className="text-[11px] text-stone-500">{product.price} · Stock: {product.stockQuantity || 35}</p>
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{product.rating}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
