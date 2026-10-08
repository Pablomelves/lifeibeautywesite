import React from 'react';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  Clock, 
  ArrowUpRight, 
  CheckCircle2, 
  Truck, 
  Eye, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { Order, AdminProduct } from '../../types';

interface AdminDashboardTabProps {
  metrics: {
    revenue: number;
    totalSales: number;
    totalOrders: number;
    customersCount: number;
    avgOrderValue: number;
    bestSellingProducts: any[];
    recentOrders: Order[];
    lowStockCount: number;
    pendingReviewsCount: number;
    unfulfilledOrdersCount: number;
  };
  onNavigateTab: (tab: string) => void;
  onViewOrder: (order: Order) => void;
  onViewProduct: (product: AdminProduct) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({
  metrics,
  onNavigateTab,
  onViewOrder,
  onViewProduct,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Header greeting & quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-700/50">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Storefront Live · Seoul Synchronized
          </div>
          <h2 className="font-anton text-2xl sm:text-3xl uppercase tracking-wide">
            Li Fei Beauty Operations Hub
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time financial summary, automated Korean fulfillment telemetry, and active catalog health.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer"
          >
            + Add Product
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-white/20"
          >
            Manage Orders ({metrics.unfulfilledOrdersCount})
          </button>
        </div>
      </div>

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Net Revenue */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Net Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-anton text-3xl text-slate-950 tracking-tight">
              ${metrics.revenue.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +24.8%
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            Calculated from verified settled transactions
          </p>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Orders</span>
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F9] text-[#EC3460] flex items-center justify-center">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-anton text-3xl text-slate-950 tracking-tight">
              {metrics.totalOrders}
            </span>
            {metrics.unfulfilledOrdersCount > 0 && (
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                {metrics.unfulfilledOrdersCount} pending
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            Avg Order Value: ${metrics.avgOrderValue.toFixed(2)}
          </p>
        </div>

        {/* Metric 3: Active Customers */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Customers</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-anton text-3xl text-slate-950 tracking-tight">
              {metrics.customersCount}
            </span>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full flex items-center">
              <ArrowUpRight size={12} className="mr-0.5" /> +18.2%
            </span>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">
            High repeat rate on Damask PDRN formulas
          </p>
        </div>

        {/* Metric 4: Inventory Alerts */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Stock Status</span>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              metrics.lowStockCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-600'
            }`}>
              <AlertTriangle size={20} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-anton text-3xl text-slate-950 tracking-tight">
              {metrics.lowStockCount}
            </span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              metrics.lowStockCount > 0 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {metrics.lowStockCount > 0 ? 'Requires Reorder' : 'All Optimal'}
            </span>
          </div>
          <button
            onClick={() => onNavigateTab('inventory')}
            className="text-[11px] font-bold text-[#EC3460] hover:underline mt-2 inline-flex items-center gap-1 cursor-pointer"
          >
            Review Inventory Matrix <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* 3. Action Alert Banners */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {metrics.unfulfilledOrdersCount > 0 && (
          <div className="bg-[#FFF5FA] border border-[#FFCDF2] p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#EC3460] text-white flex items-center justify-center shrink-0">
                <Truck size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {metrics.unfulfilledOrdersCount} Unfulfilled Korean Orders
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Orders ready for domestic packaging & USPS tracking allocation.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="px-3.5 py-1.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Fulfill Now
            </button>
          </div>
        )}

        {metrics.pendingReviewsCount > 0 && (
          <div className="bg-amber-50/60 border border-amber-200 p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  {metrics.pendingReviewsCount} Reviews Awaiting Moderation
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  Verify genuine purchaser reviews before publishing to storefront.
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('reviews')}
              className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0"
            >
              Moderate
            </button>
          </div>
        )}
      </div>

      {/* 4. Two-Column Layout: Best Selling Formulas & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Best-Selling Products Leaderboard */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-anton text-lg uppercase tracking-wide text-slate-950">
                  Best-Selling Formulations
                </h3>
                <p className="text-xs text-slate-600">
                  Ranked by gross sales volume and unit velocity
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-[#EC3460] hover:underline cursor-pointer flex items-center gap-1"
              >
                View Catalog <ChevronRight size={14} />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {metrics.bestSellingProducts.slice(0, 5).map((p, idx) => (
                <div key={p.id} className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-xs font-anton text-slate-400 text-center">
                      #{idx + 1}
                    </span>
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200/60 bg-slate-50">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover object-center" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold uppercase tracking-wide text-slate-900 truncate">
                        {p.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-slate-600 font-medium">{p.category}</span>
                        <span className="text-slate-300">·</span>
                        <span className="text-[10px] text-slate-600 font-mono">{p.price}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-bold text-slate-900 block">
                      ${p.revenue.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.2 rounded-full inline-block mt-0.5">
                      {p.sales} units sold
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Inventory coverage healthy</span>
            <span className="font-semibold text-slate-700">Seoul Direct Supply Chain Active</span>
          </div>
        </div>

        {/* Right: Recent Orders Live Feed */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-anton text-lg uppercase tracking-wide text-slate-950">
                  Recent Customer Orders
                </h3>
                <p className="text-xs text-slate-600">
                  Latest customer checkouts with live fulfillment status
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('orders')}
                className="text-xs font-bold text-[#EC3460] hover:underline cursor-pointer flex items-center gap-1"
              >
                All Orders <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-3">
              {metrics.recentOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => onViewOrder(order)}
                  className="p-3.5 rounded-2xl border border-slate-100 hover:border-[#FFCDF2] hover:bg-[#FFF0F9]/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold font-mono text-slate-950 group-hover:text-[#EC3460] transition-colors">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-600">·</span>
                      <span className="text-[11px] text-slate-600 truncate">{order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-slate-600">
                      <span>{order.date}</span>
                      <span>·</span>
                      <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div>
                      <span className="text-xs font-bold font-mono text-slate-950 block">
                        ${order.total.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                        order.fulfillmentStatus === 'delivered'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : order.fulfillmentStatus === 'shipped'
                          ? 'bg-blue-50 text-blue-800 border border-blue-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {order.fulfillmentStatus}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-[#EC3460] transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Stripe & Shopify payments synchronized</span>
            <span className="font-semibold text-emerald-700">100% Settle Rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
