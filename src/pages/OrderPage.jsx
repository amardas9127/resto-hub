import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Minus, Trash2, Send, Receipt, Search, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { format } from 'date-fns';

export default function OrderPage() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tables, menuItems, orders, kitchenOrders, addToOrder, removeFromOrder, updateOrderQty, sendToKitchen, generateBill } = useStore();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [showBillModal, setShowBillModal] = useState(false);

  // Confirm dialogs
  const [confirmKitchen, setConfirmKitchen] = useState(false);
  const [confirmRemoveItem, setConfirmRemoveItem] = useState(null); // item id
  const [orderPlaced, setOrderPlaced] = useState(false);            // success banner

  const isWaiter = user?.role === 'waiter';
  const backPath = isWaiter ? '/staff' : '/tables';

  const table = tables.find(t => String(t.id) === String(tableId));
  const tableOrder = orders[tableId] || [];

  const categories = ['All', ...new Set(menuItems.map(i => i.category))];
  const filtered = menuItems.filter(item => {
    if (!item.available) return false;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  // Active kitchen orders (sent rounds) for this table session
  const tableHistory = kitchenOrders.filter(
    o => String(o.tableId) === String(tableId) && !o.billed
  );

  const sentSubtotal = tableHistory.reduce((sum, round) => {
    return sum + (round.items || []).reduce((rSum, item) => rSum + (item.price || 0) * item.qty, 0);
  }, 0);

  const pendingSubtotal = tableOrder.reduce((s, o) => s + o.item.price * o.qty, 0);
  const grandSubtotal = sentSubtotal + pendingSubtotal;

  if (!table) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-semibold text-surface-700">Table not found</h2>
        <button onClick={() => navigate(backPath)} className="mt-4 text-primary-600 font-medium text-sm hover:underline">← Back to Tables</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <button onClick={() => navigate(backPath)} className="inline-flex items-center gap-1.5 text-sm text-surface-500 hover:text-surface-700 mb-4 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Tables
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Menu picker — 3 cols */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu…" className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-200'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filtered.map(item => {
              const inOrder = tableOrder.find(o => o.item.id === item.id);
              return (
                <button key={item.id} onClick={() => addToOrder(tableId, item)}
                  className={`relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200 hover:shadow-md flex flex-col justify-between ${inOrder ? 'border-primary-400 bg-primary-50/50' : 'border-surface-200 bg-white hover:border-primary-200'}`}>
                  <div className="h-28 w-full bg-surface-100 overflow-hidden relative">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={e => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="text-sm font-semibold text-surface-800 leading-tight">{item.name}</h4>
                    <p className="text-xs text-surface-400 mt-0.5">{item.category}</p>
                    <p className="text-sm font-bold text-primary-600 mt-1.5">₹{item.price}</p>
                  </div>
                  {inOrder && (
                    <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center shadow-md">{inOrder.qty}</span>
                  )}
                </button>
              );
            })}
          </div>
          {filtered.length === 0 && <p className="text-center text-surface-400 text-sm py-8">No items found.</p>}
        </div>

        {/* Order summary & History — 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Current Pending Cart Card */}
          <div className="bg-white rounded-2xl border border-surface-200">
            <div className="px-5 py-4 border-b border-surface-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-surface-800">{table.name}</h3>
                  <p className="text-xs text-surface-400">Current Cart ({tableOrder.length} items)</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">{table.name}</span>
              </div>
            </div>

            {/* Order Placed success banner */}
            {orderPlaced && (
              <div className="mx-4 mt-3 px-3 py-2.5 rounded-lg bg-green-50 border border-green-200 flex items-center gap-2 animate-slide-up">
                <span className="text-green-500 text-base">✓</span>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-green-700">Order sent to kitchen!</p>
                  <p className="text-xs text-green-600 mt-0.5">Add items from menu to place another round.</p>
                </div>
              </div>
            )}

            <div className="max-h-64 overflow-y-auto divide-y divide-surface-100">
              {tableOrder.length === 0 ? (
                <div className="px-5 py-8 text-center text-surface-400 text-sm">
                  Cart is empty. Tap items from the menu to build a new order round.
                </div>
              ) : (
                tableOrder.map(o => (
                  <div key={o.item.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-800 truncate">{o.item.name}</p>
                      <p className="text-xs text-surface-400">₹{o.item.price} each</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => updateOrderQty(tableId, o.item.id, o.qty - 1)} className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-50 transition-colors">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-sm font-semibold text-surface-800">{o.qty}</span>
                      <button onClick={() => updateOrderQty(tableId, o.item.id, o.qty + 1)} className="w-7 h-7 rounded-lg border border-surface-200 flex items-center justify-center text-surface-500 hover:bg-surface-50 transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold text-surface-800 w-16 text-right">₹{o.item.price * o.qty}</p>
                    <button
                      onClick={() => setConfirmRemoveItem(o.item.id)}
                      className="p-1 rounded-lg hover:bg-red-50 text-surface-300 hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {tableOrder.length > 0 && (
              <div className="p-4 border-t border-surface-100 bg-surface-50/50 rounded-b-2xl">
                <div className="flex justify-between items-center mb-3 text-sm">
                  <span className="text-surface-500 font-medium">Cart Subtotal</span>
                  <span className="font-bold text-surface-800">₹{pendingSubtotal}</span>
                </div>
                <button
                  onClick={() => setConfirmKitchen(true)}
                  className="w-full py-2.5 bg-surface-800 text-white text-sm font-semibold rounded-xl hover:bg-surface-900 transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <Send className="w-4 h-4" /> Send Round to Kitchen
                </button>
              </div>
            )}
          </div>

          {/* Order History — visible while table has sent orders */}
          {tableHistory.length > 0 && (
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary-600" />
                  <h3 className="text-sm font-bold text-surface-800">Order History (Kitchen Rounds)</h3>
                </div>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-700">
                  {tableHistory.length} round{tableHistory.length !== 1 ? 's' : ''} sent
                </span>
              </div>
              <div className="divide-y divide-surface-100 max-h-80 overflow-y-auto">
                {tableHistory.map((round, idx) => {
                  const statusStyles = {
                    pending:   { dot: 'bg-amber-400', label: 'bg-amber-50 text-amber-700 border border-amber-200' },
                    preparing: { dot: 'bg-blue-500',  label: 'bg-blue-50 text-blue-700 border border-blue-200' },
                    ready:     { dot: 'bg-green-500', label: 'bg-green-50 text-green-700 border border-green-200' },
                    cancelled: { dot: 'bg-red-400',   label: 'bg-red-50 text-red-700 border border-red-200' },
                  };
                  const st = statusStyles[round.status] || statusStyles.pending;
                  const roundTotal = (round.items || []).reduce((s, i) => s + (i.price || 0) * i.qty, 0);

                  return (
                    <div key={round.id} className="p-4 space-y-2 hover:bg-surface-50/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-surface-700 bg-surface-100 px-2 py-0.5 rounded-md">
                            Round {tableHistory.length - idx}
                          </span>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${st.label}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {round.status.charAt(0).toUpperCase() + round.status.slice(1)}
                          </span>
                        </div>
                        <span className="text-xs text-surface-400 font-medium">
                          {format(new Date(round.createdAt), 'hh:mm a')}
                        </span>
                      </div>
                      <div className="bg-surface-50/70 rounded-xl p-2.5 space-y-1">
                        {(round.items || []).map((item, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="text-surface-800 font-medium">{item.name}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-surface-400">×{item.qty} {item.price ? `(₹${item.price})` : ''}</span>
                              <span className="font-semibold text-surface-700 min-w-[3rem] text-right">
                                ₹{(item.price || 0) * item.qty}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs pt-0.5 px-1">
                        <span className="text-surface-400">Round Subtotal</span>
                        <span className="font-bold text-surface-800">₹{roundTotal}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Table Cumulative Summary & Generate Bill */}
          {(grandSubtotal > 0 || tableHistory.length > 0) && (
            <div className="bg-gradient-to-br from-surface-900 to-surface-800 text-white rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-surface-700 pb-3">
                <span className="text-xs font-medium text-surface-300 uppercase tracking-wider">Table Total Summary</span>
                <span className="text-xs bg-surface-700 text-surface-200 px-2.5 py-0.5 rounded-full font-medium">{table.name}</span>
              </div>
              <div className="space-y-1.5 text-sm">
                {tableHistory.length > 0 && (
                  <div className="flex justify-between text-surface-300">
                    <span>Sent Orders ({tableHistory.length} round{tableHistory.length !== 1 ? 's' : ''})</span>
                    <span className="font-semibold text-white">₹{sentSubtotal}</span>
                  </div>
                )}
                {tableOrder.length > 0 && (
                  <div className="flex justify-between text-surface-300">
                    <span>Unsent Cart ({tableOrder.length} items)</span>
                    <span className="font-semibold text-white">₹{pendingSubtotal}</span>
                  </div>
                )}
                <div className="flex justify-between items-baseline pt-2 border-t border-surface-700">
                  <span className="font-bold text-white text-base">Grand Total</span>
                  <span className="font-black text-xl text-primary-400">₹{grandSubtotal}</span>
                </div>
              </div>

              {!isWaiter && (
                <button
                  onClick={() => setShowBillModal(true)}
                  className="w-full mt-2 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-bold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/30 flex items-center justify-center gap-2"
                >
                  <Receipt className="w-4.5 h-4.5" /> Generate Bill & Checkout
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bill Modal */}
      {showBillModal && (
        <BillModal
          tableId={tableId}
          subtotal={grandSubtotal}
          onClose={() => setShowBillModal(false)}
          generateBill={generateBill}
          navigate={navigate}
        />
      )}

      {/* Confirm: Send to Kitchen */}
      <ConfirmDialog
        open={confirmKitchen}
        title="Send order to kitchen?"
        message={`This will send ${tableOrder.length} item(s) for ${table.name} to the kitchen. Make sure the order is complete.`}
        confirmLabel="Send to Kitchen"
        cancelLabel="Go Back"
        variant="primary"
        onConfirm={() => {
          sendToKitchen(tableId);
          setConfirmKitchen(false);
          setOrderPlaced(true);
          setTimeout(() => setOrderPlaced(false), 3500);
        }}
        onCancel={() => setConfirmKitchen(false)}
      />

      {/* Confirm: Remove item */}
      <ConfirmDialog
        open={!!confirmRemoveItem}
        title="Remove item from order?"
        message="This item will be removed from the current order."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={() => { removeFromOrder(tableId, confirmRemoveItem); setConfirmRemoveItem(null); }}
        onCancel={() => setConfirmRemoveItem(null)}
      />
    </div>
  );
}

function BillModal({ tableId, subtotal, onClose, generateBill, navigate }) {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [taxRate, setTaxRate] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [confirm, setConfirm] = useState(false);
  const tax = Math.round(subtotal * (taxRate / 100));
  const total = subtotal + tax - discount;

  const handleGenerate = () => {
    const bill = generateBill(tableId, {
      taxRate: taxRate / 100,
      discount: Number(discount),
      paymentMethod,
      customerName,
      customerPhone,
    });
    if (bill) { onClose(); navigate('/bills'); }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
        <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="px-6 py-4 border-b border-surface-100">
            <h3 className="text-lg font-semibold text-surface-900">Generate Bill</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-surface-600 font-medium">Customer Name <span className="text-surface-400 font-normal">(optional)</span></label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
              <div>
                <label className="text-xs text-surface-600 font-medium">Phone Number <span className="text-surface-400 font-normal">(optional)</span></label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                />
              </div>
            </div>

            <div className="flex justify-between text-sm"><span className="text-surface-500">Subtotal</span><span className="font-medium">₹{subtotal}</span></div>
            <div>
              <label className="text-sm text-surface-600 font-medium">Tax Rate (%)</label>
              <input type="number" min={0} max={30} value={taxRate} onChange={e => setTaxRate(Number(e.target.value))} className="w-full mt-1 px-4 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="text-sm text-surface-600 font-medium">Discount (₹)</label>
              <input type="number" min={0} value={discount} onChange={e => setDiscount(e.target.value)} className="w-full mt-1 px-4 py-2 border border-surface-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
            </div>
            <div>
              <label className="text-sm text-surface-600 font-medium">Payment Method</label>
              <div className="flex gap-2 mt-1.5">
                {['cash', 'card', 'upi'].map(m => (
                  <button key={m} onClick={() => setPaymentMethod(m)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all ${paymentMethod === m ? 'bg-primary-500 text-white' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}>
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="pt-2 border-t border-surface-100">
              <div className="flex justify-between text-sm"><span className="text-surface-500">Tax</span><span>₹{tax}</span></div>
              {discount > 0 && <div className="flex justify-between text-sm"><span className="text-surface-500">Discount</span><span className="text-green-600">-₹{discount}</span></div>}
              <div className="flex justify-between text-lg font-bold mt-2"><span>Total</span><span className="text-primary-600">₹{total}</span></div>
            </div>
            <button
              onClick={() => setConfirm(true)}
              className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20"
            >
              Generate Bill
            </button>
          </div>
        </div>
      </div>

      {/* Confirm: Generate Bill */}
      <ConfirmDialog
        open={confirm}
        title="Generate bill & close table?"
        message={`Total amount ₹${total} via ${paymentMethod.toUpperCase()}. This will clear the order and mark the table as available.`}
        confirmLabel="Generate Bill"
        cancelLabel="Review Again"
        variant="primary"
        onConfirm={handleGenerate}
        onCancel={() => setConfirm(false)}
      />
    </>
  );
}
