import { useState } from 'react';
import { Receipt, Search, Printer, Eye, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';

function BillDetailModal({ bill, onClose }) {
  if (!bill) return null;

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=400,height=600');
    w.document.write(`
      <html><head><title>Bill #${bill.id}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 20px; max-width: 350px; margin: 0 auto; }
        h2 { text-align: center; margin-bottom: 5px; } hr { border: 1px dashed #ccc; }
        .row { display: flex; justify-content: space-between; padding: 3px 0; font-size: 14px; }
        .total { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 8px; margin-top: 8px; }
        .center { text-align: center; font-size: 12px; color: #666; }
      </style></head><body>
      <h2>RestroHub</h2>
      <p class="center">Bill #${bill.id}</p>
      <p class="center">${format(new Date(bill.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
      <p class="center">${bill.tableName}</p>
      ${bill.customerName ? `<p class="center">Customer: ${bill.customerName} ${bill.customerPhone ? `(${bill.customerPhone})` : ''}</p>` : ''}
      <hr/>
      ${bill.items.map(i => `<div class="row"><span>${i.name} ×${i.qty}</span><span>₹${i.total}</span></div>`).join('')}
      <hr/>
      <div class="row"><span>Subtotal</span><span>₹${bill.subtotal}</span></div>
      <div class="row"><span>Tax (${(bill.taxRate * 100).toFixed(0)}%)</span><span>₹${bill.tax}</span></div>
      ${bill.discount > 0 ? `<div class="row"><span>Discount</span><span>-₹${bill.discount}</span></div>` : ''}
      <div class="row total"><span>Total</span><span>₹${bill.total}</span></div>
      <p class="center" style="margin-top:12px">Payment: ${bill.paymentMethod.toUpperCase()}</p>
      <p class="center">Thank you for dining with us!</p>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 sticky top-0 bg-white rounded-t-2xl">
          <h3 className="text-lg font-semibold text-surface-900">Bill Details</h3>
          <div className="flex gap-1">
            <button onClick={handlePrint} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><Printer className="w-5 h-5" /></button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Bill ID</span>
            <span className="font-mono text-surface-700">{bill.id}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Table</span>
            <span className="font-medium">{bill.tableName}</span>
          </div>
          {bill.customerName && (
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Customer Name</span>
              <span className="font-medium text-surface-800">{bill.customerName}</span>
            </div>
          )}
          {bill.customerPhone && (
            <div className="flex justify-between text-sm">
              <span className="text-surface-500">Phone Number</span>
              <span className="font-mono text-surface-800">{bill.customerPhone}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-surface-500">Date</span>
            <span>{format(new Date(bill.createdAt), 'dd MMM yyyy, hh:mm a')}</span>
          </div>
          <hr className="border-surface-100" />
          {bill.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <span className="text-surface-700">{item.name} <span className="text-surface-400">×{item.qty}</span></span>
              <span className="font-medium">₹{item.total}</span>
            </div>
          ))}
          <hr className="border-surface-100" />
          <div className="flex justify-between text-sm"><span className="text-surface-500">Subtotal</span><span>₹{bill.subtotal}</span></div>
          <div className="flex justify-between text-sm"><span className="text-surface-500">Tax ({(bill.taxRate * 100).toFixed(0)}%)</span><span>₹{bill.tax}</span></div>
          {bill.discount > 0 && <div className="flex justify-between text-sm"><span className="text-surface-500">Discount</span><span className="text-green-600">-₹{bill.discount}</span></div>}
          <div className="flex justify-between text-xl font-bold pt-2 border-t border-surface-200">
            <span>Total</span>
            <span className="text-primary-600">₹{bill.total}</span>
          </div>
          <div className="text-center">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-surface-100 text-surface-600 uppercase">{bill.paymentMethod}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillsPage() {
  const { bills } = useStore();
  const [search, setSearch] = useState('');
  const [selectedBill, setSelectedBill] = useState(null);

  const filtered = bills.filter(b =>
    b.tableName.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    (b.customerName && b.customerName.toLowerCase().includes(search.toLowerCase())) ||
    (b.customerPhone && b.customerPhone.includes(search))
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID, Table, Customer, or Phone…" className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-sm" />
        </div>
        <p className="text-sm text-surface-500">{filtered.length} bills</p>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Bill ID</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Table</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Customer Name</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Phone Number</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Total</th>
                <th className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Payment</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(bill => (
                <tr key={bill.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3.5"><span className="text-sm font-mono text-surface-600">{bill.id}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm font-medium text-surface-800">{bill.tableName}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm text-surface-700">{bill.customerName || '—'}</span></td>
                  <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm font-mono text-surface-500">{bill.customerPhone || '—'}</span></td>
                  <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-sm text-surface-500">{format(new Date(bill.createdAt), 'dd MMM, hh:mm a')}</span></td>
                  <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-surface-800">₹{bill.total}</span></td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell"><span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-100 text-surface-600 uppercase">{bill.paymentMethod}</span></td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => setSelectedBill(bill)} className="p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="px-5 py-16 text-center">
            <Receipt className="w-10 h-10 mx-auto text-surface-300 mb-3" />
            <p className="text-surface-400 text-sm">No bills found.</p>
          </div>
        )}
      </div>

      <BillDetailModal bill={selectedBill} onClose={() => setSelectedBill(null)} />
    </div>
  );
}
