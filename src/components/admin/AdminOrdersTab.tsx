import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Eye, 
  Truck, 
  CheckCircle, 
  RotateCcw, 
  X, 
  ExternalLink, 
  Calendar, 
  User, 
  MapPin, 
  CreditCard,
  Package,
  FileText
} from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersTabProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onCancelAndRefund: (orderId: string) => void;
  onFulfillOrder: (orderId: string, trackingNumber: string, carrier?: string) => void;
  selectedOrderForModal?: Order | null;
  onCloseOrderModal?: () => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  orders,
  onUpdateOrder,
  onCancelAndRefund,
  onFulfillOrder,
  selectedOrderForModal,
  onCloseOrderModal,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeModalOrder, setActiveModalOrder] = useState<Order | null>(selectedOrderForModal || null);

  // Tracking input state in details modal
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierInput, setCarrierInput] = useState('USPS Priority');

  React.useEffect(() => {
    if (selectedOrderForModal) {
      setActiveModalOrder(selectedOrderForModal);
      setTrackingInput(selectedOrderForModal.trackingNumber || '');
      setCarrierInput(selectedOrderForModal.carrier || 'USPS Priority');
    }
  }, [selectedOrderForModal]);

  const handleOpenOrder = (order: Order) => {
    setActiveModalOrder(order);
    setTrackingInput(order.trackingNumber || '');
    setCarrierInput(order.carrier || 'USPS Priority');
  };

  const handleCloseModal = () => {
    setActiveModalOrder(null);
    if (onCloseOrderModal) onCloseOrderModal();
  };

  const handleSaveTracking = () => {
    if (!activeModalOrder) return;
    onFulfillOrder(activeModalOrder.id, trackingInput, carrierInput);
    setActiveModalOrder({
      ...activeModalOrder,
      fulfillmentStatus: 'shipped',
      trackingNumber: trackingInput,
      carrier: carrierInput,
    });
  };

  const handleRefund = (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel and refund this order?')) {
      onCancelAndRefund(orderId);
      if (activeModalOrder && activeModalOrder.id === orderId) {
        setActiveModalOrder({
          ...activeModalOrder,
          paymentStatus: 'refunded',
          fulfillmentStatus: 'unfulfilled',
        });
      }
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(search.toLowerCase()) ||
      (o.trackingNumber && o.trackingNumber.includes(search));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'unfulfilled') return o.fulfillmentStatus === 'unfulfilled';
    if (statusFilter === 'shipped') return o.fulfillmentStatus === 'shipped';
    if (statusFilter === 'delivered') return o.fulfillmentStatus === 'delivered';
    if (statusFilter === 'cancelled') return o.fulfillmentStatus === 'cancelled';
    if (statusFilter === 'paid') return o.paymentStatus === 'paid';
    if (statusFilter === 'refunded') return o.paymentStatus === 'refunded';

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Customer Orders &amp; Dispatch
          </h2>
          <p className="text-xs text-slate-500">
            {orders.length} total orders ({orders.filter(o => o.fulfillmentStatus === 'unfulfilled' && o.paymentStatus === 'paid').length} unfulfilled)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200">
            ● Real-Time Checkout Sync
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order #, customer name, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#EC3460] focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">All Orders</option>
            <option value="unfulfilled">Unfulfilled Only</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
            <option value="paid">Payment: Paid</option>
            <option value="refunded">Payment: Refunded</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date &amp; Time</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Items</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Fulfillment</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No orders matching this filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  return (
                    <tr 
                      key={order.id} 
                      onClick={() => handleOpenOrder(order)}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer group"
                    >
                      {/* Order Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-950 group-hover:text-[#EC3460] transition-colors">
                        {order.orderNumber}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {order.date}
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block truncate max-w-[150px]">
                          {order.customer.name}
                        </span>
                        <span className="text-[10px] text-slate-500 truncate block max-w-[150px]">
                          {order.customer.email}
                        </span>
                      </td>

                      {/* Items Preview */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-800">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({order.items.reduce((s, i) => s + i.quantity, 0)} units)
                          </span>
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-950">
                        ${order.total.toFixed(2)}
                      </td>

                      {/* Payment Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block border ${
                          order.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : order.paymentStatus === 'refunded'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          ● {order.paymentStatus}
                        </span>
                      </td>

                      {/* Fulfillment Status */}
                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block border ${
                          order.fulfillmentStatus === 'delivered'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : order.fulfillmentStatus === 'shipped'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : order.fulfillmentStatus === 'cancelled'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          {order.fulfillmentStatus}
                        </span>
                      </td>

                      {/* View Action */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenOrder(order);
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#FFF0F9] text-slate-700 hover:text-[#EC3460] font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================================================================= */}
      {/* Order Details Modal */}
      {/* ================================================================= */}
      {activeModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 p-6 sm:p-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
                    Order {activeModalOrder.orderNumber}
                  </h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    activeModalOrder.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    {activeModalOrder.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Placed {activeModalOrder.date}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-6 text-xs">
              {/* Customer Information & Delivery Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <User size={14} className="text-[#EC3460]" />
                    Customer Details
                  </h4>
                  <p className="font-bold text-slate-900">{activeModalOrder.customer.name}</p>
                  <p className="text-slate-600">{activeModalOrder.customer.email}</p>
                  {activeModalOrder.customer.phone && (
                    <p className="text-slate-600">{activeModalOrder.customer.phone}</p>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#EC3460]" />
                    Shipping Destination
                  </h4>
                  <p className="text-slate-800">{activeModalOrder.customer.address}</p>
                  <p className="text-slate-800">
                    {activeModalOrder.customer.city}, {activeModalOrder.customer.state || ''} {activeModalOrder.customer.zip}
                  </p>
                  <p className="text-slate-800 font-semibold">{activeModalOrder.customer.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Items Purchased ({activeModalOrder.items.length})
                </h4>
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
                  {activeModalOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                        </div>
                        <div>
                          <h5 className="font-bold uppercase text-slate-900">{item.name}</h5>
                          <span className="text-slate-500 text-[11px] block">{item.variant}</span>
                          <span className="text-slate-400 text-[10px]">Qty: {item.quantity} × ${item.price.toFixed(2)}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Calculation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>${activeModalOrder.subtotal.toFixed(2)}</span>
                </div>
                {activeModalOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount ({activeModalOrder.discountCode || 'Promo'}):</span>
                    <span>-${activeModalOrder.discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Shipping:</span>
                  <span>{activeModalOrder.shippingCost === 0 ? 'FREE' : `$${activeModalOrder.shippingCost.toFixed(2)}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-xs text-slate-950">
                  <span>Total Paid:</span>
                  <span>${activeModalOrder.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Fulfillment & Tracking Section */}
              <div className="p-4 rounded-2xl border border-slate-200 space-y-3 bg-white">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Truck size={15} className="text-[#EC3460]" />
                  Fulfillment &amp; Courier Tracking
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Carrier</label>
                    <input
                      type="text"
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      placeholder="e.g. USPS Priority / FedEx Express / DHL"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[11px] mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="e.g. 9400111899223199842109"
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#EC3460] font-mono"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleSaveTracking}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    Save &amp; Mark as Shipped
                  </button>

                  {activeModalOrder.fulfillmentStatus !== 'delivered' && (
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateOrder(activeModalOrder.id, { fulfillmentStatus: 'delivered' });
                        setActiveModalOrder({ ...activeModalOrder, fulfillmentStatus: 'delivered' });
                      }}
                      className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                    >
                      Mark Delivered
                    </button>
                  )}
                </div>
              </div>

              {/* Order Notes */}
              {activeModalOrder.notes && (
                <div className="p-3.5 bg-rose-50/60 border border-rose-100 rounded-2xl text-slate-700">
                  <span className="font-bold block text-slate-900 uppercase text-[10px]">Customer / Admin Note:</span>
                  <p className="mt-0.5">{activeModalOrder.notes}</p>
                </div>
              )}

              {/* Action Buttons: Cancel & Refund */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {activeModalOrder.paymentStatus !== 'refunded' ? (
                  <button
                    type="button"
                    onClick={() => handleRefund(activeModalOrder.id)}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Cancel &amp; Issue Full Refund
                  </button>
                ) : (
                  <span className="text-xs text-rose-600 font-bold">
                    Order Refunded &amp; Closed
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
