import React, { useState } from 'react';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  X, 
  ExternalLink, 
  Copy, 
  Check, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Mail,
  User,
  ShoppingBag
} from 'lucide-react';
import { Order } from '../types';
import { getAdminOrders, findOrderForTracking } from '../services/adminService';

interface TrackOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialOrderNumber?: string;
  initialEmail?: string;
}

export const TrackOrderModal: React.FC<TrackOrderModalProps> = ({
  isOpen,
  onClose,
  initialOrderNumber = '',
  initialEmail = '',
}) => {
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [email, setEmail] = useState(initialEmail);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [matchedOrder, setMatchedOrder] = useState<Order | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && initialOrderNumber) {
      setOrderNumber(initialOrderNumber);
      setEmail(initialEmail);
      triggerLookup();
    }
  }, [isOpen, initialOrderNumber, initialEmail]);

  if (!isOpen) return null;

  const triggerLookup = async () => {
    setSearched(true); setLoading(false); setMatchedOrder(null);
    setErrorMessage('Order lookup is not connected here. Use the tracking link in your Shopify shipping confirmation or contact Li Fei Beauty for help.');
  };

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    triggerLookup();
  };

  const handleCopyTracking = (code: string) => {
    navigator.clipboard?.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Timeline step calculation
  const getTimelineSteps = (order: Order) => {
    const isDelivered = order.fulfillmentStatus === 'delivered';
    const isShipped = order.fulfillmentStatus === 'shipped' || isDelivered;
    const isPaid = order.paymentStatus === 'paid';

    return [
      {
        step: 1,
        title: 'Order Confirmed',
        desc: `Verified payment & Seoul laboratory batch authorization`,
        date: order.date,
        completed: isPaid,
        active: !isShipped && !isDelivered,
      },
      {
        step: 2,
        title: 'Inspected & Temperature-Sealed',
        desc: 'Formula integrity preserved in insulated packaging',
        date: isShipped || isDelivered ? 'Seoul Cold-Chain Verified' : 'In Progress',
        completed: isShipped || isDelivered,
        active: !isShipped && !isDelivered,
      },
      {
        step: 3,
        title: 'Dispatched with Courier',
        desc: order.carrier ? `${order.carrier} Express Transit` : 'USPS Priority Dispatch',
        date: order.trackingNumber ? `Tracking: ${order.trackingNumber.slice(0, 8)}...` : 'Label Pending',
        completed: isShipped || isDelivered,
        active: isShipped && !isDelivered,
      },
      {
        step: 4,
        title: 'Delivered to Destination',
        desc: `${order.customer.city}, ${order.customer.country}`,
        date: isDelivered ? 'Delivered' : 'Est. 2–4 Business Days',
        completed: isDelivered,
        active: isDelivered,
      },
    ];
  };

  return (
    <div 
      className="fixed inset-0 z-[140] bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 font-inter animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200/90 text-slate-900 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF0F9] text-[#EC3460] flex items-center justify-center shadow-cotton">
              <Truck size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#FFF0F9] text-[#B31940] px-2 py-0.5 rounded-full border border-[#FFCDF2]">
                  SEOUL DISPATCH TRACKER
                </span>
              </div>
              <h3 className="font-anton text-xl uppercase tracking-wide text-slate-950 mt-0.5">
                Track My Order &amp; Delivery Status
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close tracking modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Lookup Input Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Order Number *
                </label>
                <div className="relative">
                  <Package size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    placeholder="e.g. #LF-1048 or 1048"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-[#EC3460] focus:bg-white transition-colors uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Address <span className="text-slate-400 font-normal">(Optional for lookup)</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. evelyn.vance@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-[#EC3460] focus:bg-white transition-colors"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#EC3460] hover:bg-[#D8224F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-raspberry cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Locating Package...</span>
                  </>
                ) : (
                  <>
                    <Search size={14} />
                    <span>Track Package</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-[11px] text-rose-600 mt-0.5">
                  Check the order number in your confirmation email and try again.
                </p>
              </div>
            </div>
          )}

          {/* Order Found Result View */}
          {matchedOrder && !loading && (
            <div className="space-y-6 pt-2 animate-fadeIn">
              {/* Order Overview Banner */}
              <div className="bg-gradient-to-br from-[#FFF5FA] to-[#FFF0F9] p-5 sm:p-6 rounded-3xl border border-[#FFCDF2] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-anton text-2xl tracking-tight text-slate-950 uppercase">
                      Order {matchedOrder.orderNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                      matchedOrder.fulfillmentStatus === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : matchedOrder.fulfillmentStatus === 'shipped'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      ● {matchedOrder.fulfillmentStatus === 'delivered' 
                          ? 'Package Delivered' 
                          : matchedOrder.fulfillmentStatus === 'shipped' 
                          ? 'In Transit' 
                          : 'Preparing in Seoul'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600">
                    Ordered on {matchedOrder.date} · Recipient: <span className="font-semibold text-slate-900">{matchedOrder.customer.name}</span>
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-xs text-slate-500 block">Total Order Value</span>
                  <span className="font-mono text-xl font-bold text-slate-950">
                    ${matchedOrder.total.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Progress Milestones Stepper */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-5 flex items-center gap-2">
                  <Clock size={15} className="text-[#EC3460]" />
                  <span>Fulfillment &amp; Courier Journey</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {getTimelineSteps(matchedOrder).map((step) => (
                    <div key={step.step} className="relative flex items-start gap-4">
                      {/* Check dot */}
                      <div className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                        step.completed
                          ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                          : step.active
                          ? 'bg-[#EC3460] border-[#EC3460] text-white animate-pulse'
                          : 'bg-white border-slate-300 text-transparent'
                      }`}>
                        <Check size={10} strokeWidth={3} />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className={`text-xs font-bold ${step.completed || step.active ? 'text-slate-950' : 'text-slate-400'}`}>
                            {step.title}
                          </h5>
                          <span className="text-[10px] font-mono text-slate-500">
                            {step.date}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courier & Tracking Code Box */}
              {matchedOrder.trackingNumber ? (
                <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block mb-0.5">
                      Carrier: {matchedOrder.carrier || 'Express Courier'}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-950 text-sm">
                        {matchedOrder.trackingNumber}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyTracking(matchedOrder.trackingNumber!)}
                      className="px-3 py-1.5 bg-white text-slate-700 border border-blue-200 rounded-xl font-bold text-[11px] hover:bg-blue-50 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      {copiedTracking ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                      <span>{copiedTracking ? 'Copied' : 'Copy Tracking'}</span>
                    </button>

                    <a
                      href={`https://tools.usps.com/go/TrackConfirmAction?tLabels=${matchedOrder.trackingNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-[11px] transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Track with Carrier</span>
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-center gap-3 text-xs text-amber-900">
                  <Clock size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <span className="font-bold block">Seoul Warehouse Fulfillment in Progress</span>
                    <span className="text-[11px] text-amber-800">
                      Tracking number will be assigned automatically upon courier dispatch handover.
                    </span>
                  </div>
                </div>
              )}

              {/* Package Line Items */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                  <ShoppingBag size={15} className="text-[#EC3460]" />
                  <span>Items in This Package ({matchedOrder.items.length})</span>
                </h4>

                <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
                  {matchedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3.5 flex items-center justify-between gap-3 bg-slate-50/40">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover object-center" />
                        </div>
                        <div>
                          <h5 className="font-bold uppercase text-slate-900 text-xs">{item.name}</h5>
                          <span className="text-slate-500 text-[11px] block">{item.variant}</span>
                          <span className="text-slate-400 text-[10px]">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
                <MapPin size={16} className="text-[#EC3460] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase text-slate-900 text-[10px] block">
                    Shipping Destination
                  </span>
                  <p className="text-slate-800 font-semibold mt-0.5">
                    {matchedOrder.customer.name}
                  </p>
                  <p className="text-slate-600">
                    {matchedOrder.customer.address}, {matchedOrder.customer.city} {matchedOrder.customer.zip}
                  </p>
                  <p className="text-slate-600">
                    {matchedOrder.customer.country}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Guarantees & Support footer */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Direct Seoul Cold-Chain Dispatch · Authentic Batch Verified</span>
            </div>

            <a
              href="mailto:support@lifeibeauty.com"
              className="text-[#EC3460] font-bold hover:underline"
            >
              Need help with your package? Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
