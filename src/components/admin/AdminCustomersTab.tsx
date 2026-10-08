import React, { useState } from 'react';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign, 
  ShoppingBag, 
  Edit3, 
  Check, 
  Tag, 
  Calendar,
  X
} from 'lucide-react';
import { Customer } from '../../types';

interface AdminCustomersTabProps {
  customers: Customer[];
  onUpdateCustomer: (customerId: string, updates: Partial<Customer>) => void;
}

export const AdminCustomersTab: React.FC<AdminCustomersTabProps> = ({
  customers,
  onUpdateCustomer,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEditingNotes(customer.notes || '');
    setIsEditingNotes(false);
  };

  const handleSaveNotes = () => {
    if (!selectedCustomer) return;
    onUpdateCustomer(selectedCustomer.id, { notes: editingNotes });
    setSelectedCustomer({ ...selectedCustomer, notes: editingNotes });
    setIsEditingNotes(false);
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search)) ||
    c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-anton text-2xl uppercase tracking-wide text-slate-950">
            Customer Profiles &amp; Loyalty
          </h2>
          <p className="text-xs text-slate-500">
            {customers.length} verified skincare clients with lifetime value metrics
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, or tags (VIP)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#EC3460] focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Customers Table & Details Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Orders</th>
                  <th className="py-3.5 px-4">Total Spent</th>
                  <th className="py-3.5 px-4">Tags</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">
                      No customers found.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((cust) => {
                    const isSelected = selectedCustomer?.id === cust.id;
                    return (
                      <tr
                        key={cust.id}
                        onClick={() => handleSelectCustomer(cust)}
                        className={`hover:bg-slate-50/60 transition-colors cursor-pointer ${
                          isSelected ? 'bg-rose-50/40' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center shrink-0 uppercase border border-slate-200">
                              {cust.name.substring(0, 2)}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-950 truncate max-w-[150px]">
                                {cust.name}
                              </h4>
                              <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                                {cust.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-semibold text-slate-800">
                          {cust.ordersCount} {cust.ordersCount === 1 ? 'order' : 'orders'}
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-slate-950">
                          ${cust.totalSpent.toFixed(2)}
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1">
                            {cust.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-[9px] font-bold bg-[#FFF0F9] text-[#EC3460] px-2 py-0.5 rounded-full border border-[#FFCDF2]/50">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCustomer(cust);
                            }}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-[#FFF0F9] text-slate-700 hover:text-[#EC3460] rounded-xl font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            View
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

        {/* Customer Profile Card (1 col) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          {selectedCustomer ? (
            <div className="space-y-5 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Profile Details
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  ID: {selectedCustomer.id}
                </span>
              </div>

              {/* Name & Avatar */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#EC3460] to-[#DF4D6E] text-white font-anton text-xl flex items-center justify-center uppercase shadow-raspberry">
                  {selectedCustomer.name.substring(0, 2)}
                </div>
                <div>
                  <h3 className="font-anton text-lg uppercase text-slate-950">
                    {selectedCustomer.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                    <Calendar size={12} />
                    <span>Member since {selectedCustomer.joinedDate}</span>
                  </div>
                </div>
              </div>

              {/* Contact info */}
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail size={13} className="text-[#EC3460]" />
                  <span className="truncate">{selectedCustomer.email}</span>
                </div>
                {selectedCustomer.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone size={13} className="text-[#EC3460]" />
                    <span>{selectedCustomer.phone}</span>
                  </div>
                )}
                {selectedCustomer.shippingAddress && (
                  <div className="flex items-start gap-2 text-slate-700 pt-1 border-t border-slate-200/60">
                    <MapPin size={13} className="text-[#EC3460] shrink-0 mt-0.5" />
                    <span>
                      {selectedCustomer.shippingAddress.address}, {selectedCustomer.shippingAddress.city} {selectedCustomer.shippingAddress.zip}
                    </span>
                  </div>
                )}
              </div>

              {/* Financial Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-center">
                  <span className="text-[10px] font-bold text-emerald-800 uppercase block">Lifetime Value</span>
                  <span className="font-anton text-xl text-emerald-950 block mt-0.5">
                    ${selectedCustomer.totalSpent.toFixed(2)}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200/60 text-center">
                  <span className="text-[10px] font-bold text-blue-800 uppercase block">Total Orders</span>
                  <span className="font-anton text-xl text-blue-950 block mt-0.5">
                    {selectedCustomer.ordersCount}
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div>
                <span className="font-bold text-slate-700 block mb-1.5 uppercase text-[10px]">
                  Customer Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCustomer.tags.map((tag, i) => (
                    <span key={i} className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Editable Notes */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-700 uppercase text-[10px]">
                    Customer Notes
                  </span>
                  {!isEditingNotes && (
                    <button
                      onClick={() => setIsEditingNotes(true)}
                      className="text-[#EC3460] font-bold text-[10px] hover:underline cursor-pointer"
                    >
                      Edit Notes
                    </button>
                  )}
                </div>

                {isEditingNotes ? (
                  <div className="space-y-2">
                    <textarea
                      rows={3}
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Add private customer preference notes, skin concerns, or special requests..."
                      className="w-full p-2.5 bg-slate-50 border border-[#EC3460] rounded-xl text-xs focus:outline-none text-slate-900"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsEditingNotes(false)}
                        className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveNotes}
                        className="px-3 py-1 bg-[#EC3460] text-white rounded-lg text-[10px] font-bold cursor-pointer"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 text-xs italic">
                    {selectedCustomer.notes || 'No notes on this customer yet.'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-20 text-center text-slate-400">
              <User size={36} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">Select a customer from the table to view their full profile, orders, and notes.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
