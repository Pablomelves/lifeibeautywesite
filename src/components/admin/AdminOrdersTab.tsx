import React, { useState } from 'react';
import { Search, Eye, Truck, CheckCircle, XCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersTabProps {
  orders: Order[];
  onSaveOrders: (orders: Order[]) => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({ orders, onSaveOrders }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filtered = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUpdateStatus = (
    orderId: string,
    fulfillmentStatus: Order['fulfillmentStatus'],
    trackingNumber?: string,
    carrier?: string
  ) => {
    const updated = orders.map((o) =>
      o.id === orderId
        ? {
            ...o,
            fulfillmentStatus,
            trackingNumber: trackingNumber !== undefined ? trackingNumber : o.trackingNumber,
            carrier: carrier !== undefined ? carrier : o.carrier
          }
        : o
    );
    onSaveOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(updated.find((o) => o.id === orderId) || null);
    }
  };

  const handleRefund = (orderId: string) => {
    if (confirm('Issue full refund for this order?')) {
      const updated = orders.map((o) =>
        o.id === orderId ? { ...o, paymentStatus: 'refunded' as const, fulfillmentStatus: 'cancelled' as const } : o
      );
      onSaveOrders(updated);
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(updated.find((o) => o.id === orderId) || null);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Orders & Fulfillment</h2>
          <p className="text-xs text-stone-500">
            Track customer orders, manage shipments, add carrier tracking, and process refunds
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <Search className="w-4 h-4 text-stone-400 ml-2" />
        <input
          type="text"
          placeholder="Search by order number (#LF-1048), customer name, or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
        />
        <span className="text-xs text-stone-400 font-medium mr-2">{filtered.length} orders</span>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Fulfillment</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((order) => (
                <tr key={order.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-stone-900">{order.orderNumber}</td>
                  <td className="py-3.5 px-4 text-stone-500">{order.date}</td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-stone-800">{order.customer.name}</div>
                    <div className="text-[11px] text-stone-400">{order.customer.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{order.items.length} items</td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">${order.total.toFixed(2)}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.paymentStatus === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        order.fulfillmentStatus === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.fulfillmentStatus === 'shipped'
                          ? 'bg-blue-100 text-blue-800'
                          : order.fulfillmentStatus === 'cancelled'
                          ? 'bg-stone-200 text-stone-600'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {order.fulfillmentStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col text-xs">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <div>
                <h3 className="font-bold text-stone-900 text-base">{selectedOrder.orderNumber}</h3>
                <p className="text-stone-400 text-[11px]">{selectedOrder.date}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Customer and Shipping Details */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] mb-1">
                    Customer Info
                  </h4>
                  <p className="font-semibold text-stone-800">{selectedOrder.customer.name}</p>
                  <p className="text-stone-500">{selectedOrder.customer.email}</p>
                  <p className="text-stone-500">{selectedOrder.customer.phone || 'No phone recorded'}</p>
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] mb-1">
                    Shipping Destination
                  </h4>
                  <p className="text-stone-600">{selectedOrder.customer.address}</p>
                  <p className="text-stone-600">
                    {selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zip}
                  </p>
                  <p className="text-stone-600">{selectedOrder.customer.country}</p>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px] mb-2">
                  Purchased Items
                </h4>
                <div className="divide-y divide-stone-100 border border-stone-200 rounded-xl overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-white">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg border border-stone-200 p-1 flex items-center justify-center bg-stone-50">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="max-h-full w-auto object-contain" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-stone-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{item.name}</p>
                          <p className="text-stone-400 text-[11px]">
                            Qty: {item.quantity} · ${item.price.toFixed(2)} each
                          </p>
                        </div>
                      </div>
                      <span className="font-bold text-stone-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking & Carrier Updater */}
              <div className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-3">
                <h4 className="font-bold text-stone-900 uppercase tracking-wider text-[10px]">
                  Carrier & Fulfillment Control
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Tracking Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 9400111899223199842109"
                      value={selectedOrder.trackingNumber || ''}
                      onChange={(e) =>
                        handleUpdateStatus(
                          selectedOrder.id,
                          selectedOrder.fulfillmentStatus,
                          e.target.value,
                          selectedOrder.carrier
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-600 font-semibold mb-1">Shipping Carrier</label>
                    <input
                      type="text"
                      placeholder="e.g. USPS Priority, FedEx, DHL"
                      value={selectedOrder.carrier || ''}
                      onChange={(e) =>
                        handleUpdateStatus(
                          selectedOrder.id,
                          selectedOrder.fulfillmentStatus,
                          selectedOrder.trackingNumber,
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-200 bg-white"
                    />
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipped')}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Mark as Shipped
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'delivered')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg cursor-pointer"
                  >
                    Mark as Delivered
                  </button>
                  <button
                    onClick={() => handleRefund(selectedOrder.id)}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-lg cursor-pointer ml-auto"
                  >
                    Cancel & Refund Order
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
