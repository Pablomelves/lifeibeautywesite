import React, { useState } from 'react';
import { Search, User, Mail, Phone, MapPin, Tag, Plus } from 'lucide-react';
import { Customer } from '../../types';

interface AdminCustomersTabProps {
  customers: Customer[];
  onSaveCustomers: (customers: Customer[]) => void;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  onSaveCustomers
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [newTag, setNewTag] = useState('');

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddTag = (customerId: string) => {
    if (!newTag.trim()) return;
    const updated = customers.map((c) =>
      c.id === customerId ? { ...c, tags: [...(c.tags || []), newTag.trim()] } : c
    );
    onSaveCustomers(updated);
    setNewTag('');
    if (selectedCustomer && selectedCustomer.id === customerId) {
      setSelectedCustomer(updated.find((c) => c.id === customerId) || null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Customers & VIP Accounts</h2>
          <p className="text-xs text-stone-500">
            View customer profiles, purchase history, order volumes, and lifetime value
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-stone-200 shadow-2xs">
        <Search className="w-4 h-4 text-stone-400 ml-2" />
        <input
          type="text"
          placeholder="Search by customer name, email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 text-xs text-stone-800 placeholder-stone-400 focus:outline-none"
        />
        <span className="text-xs text-stone-400 font-medium mr-2">
          {filtered.length} customers
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Total Spent</th>
                <th className="py-3 px-4">Last Order</th>
                <th className="py-3 px-4">Tags</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-stone-700">
              {filtered.map((customer) => (
                <tr key={customer.id} className="hover:bg-stone-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                        {customer.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-stone-900">{customer.name}</div>
                        <div className="text-[11px] text-stone-400">{customer.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-stone-800">
                    {customer.ordersCount} orders
                  </td>
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    ${customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-stone-500">{customer.lastOrderDate}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-wrap gap-1">
                      {(customer.tags || []).map((tag, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setSelectedCustomer(customer)}
                      className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold rounded-lg transition-colors cursor-pointer"
                    >
                      Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
              <h3 className="font-bold text-stone-900 text-base">Customer Details</h3>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-stone-900 text-white flex items-center justify-center font-bold text-base">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-stone-900 text-base">{selectedCustomer.name}</h4>
                  <p className="text-stone-500">{selectedCustomer.email}</p>
                  <p className="text-stone-500">{selectedCustomer.phone || 'No phone recorded'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Lifetime Spend</span>
                  <span className="text-base font-extrabold text-stone-900">
                    ${selectedCustomer.totalSpent.toFixed(2)}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Total Orders</span>
                  <span className="text-base font-extrabold text-stone-900">
                    {selectedCustomer.ordersCount} completed
                  </span>
                </div>
              </div>

              {selectedCustomer.shippingAddress && (
                <div>
                  <h5 className="font-bold text-stone-900 mb-1">Saved Address</h5>
                  <p className="text-stone-600">{selectedCustomer.shippingAddress.address}</p>
                  <p className="text-stone-600">
                    {selectedCustomer.shippingAddress.city}, {selectedCustomer.shippingAddress.country}
                  </p>
                </div>
              )}

              {selectedCustomer.notes && (
                <div>
                  <h5 className="font-bold text-stone-900 mb-1">Internal Notes</h5>
                  <p className="text-stone-600 bg-amber-50/60 p-2.5 rounded-lg border border-amber-200/60">
                    {selectedCustomer.notes}
                  </p>
                </div>
              )}

              {/* Tag Add */}
              <div>
                <h5 className="font-bold text-stone-900 mb-1.5">Add VIP Tag</h5>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. VIP, Influencer, Fragile Barrier"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-stone-200"
                  />
                  <button
                    onClick={() => handleAddTag(selectedCustomer.id)}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-black text-white font-bold rounded-lg cursor-pointer"
                  >
                    Add Tag
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
