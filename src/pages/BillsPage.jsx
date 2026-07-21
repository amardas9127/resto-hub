import { useState } from 'react';
import { Receipt, Search, Printer, Eye, X, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { format } from 'date-fns';

/* ── Print helper ──────────────────────────────────────────────────────────── */
function buildPrintHTML(bill) {
  const rows = bill.items
    .map(
      (item, i) => `
      <tr class="${i % 2 === 0 ? 'even' : ''}">
        <td class="sno">${i + 1}</td>
        <td class="desc">${item.name}</td>
        <td class="num">₹${Number(item.price || 0).toFixed(2)}</td>
        <td class="num">${item.qty}</td>
        <td class="num amt">₹${Number(item.total || 0).toFixed(2)}</td>
      </tr>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Invoice – ${bill.id}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#1e293b;padding:32px;max-width:680px;margin:0 auto;font-size:13px}

    /* ── Header ── */
    .header{display:flex;align-items:center;justify-content:space-between;padding-bottom:18px;border-bottom:2px solid #f59e0b}
    .brand{display:flex;align-items:center;gap:12px}
    .logo-box{width:44px;height:44px;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:10px;display:flex;align-items:center;justify-content:center}
    .logo-box svg{width:24px;height:24px;stroke:#fff;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
    .brand-name{font-size:22px;font-weight:800;color:#1e293b;letter-spacing:-0.5px}
    .brand-name span{color:#f59e0b}
    .brand-tag{font-size:10px;color:#94a3b8;letter-spacing:1px;text-transform:uppercase;margin-top:2px}
    .invoice-label{text-align:right}
    .invoice-label h2{font-size:18px;font-weight:700;color:#1e293b;text-transform:uppercase;letter-spacing:1px}
    .invoice-label .inv-no{font-size:12px;color:#64748b;margin-top:4px;font-family:monospace}

    /* ── Info Block ── */
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0}
    .info-block{}
    .info-block .label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#94a3b8;margin-bottom:4px}
    .info-block .value{font-size:13px;font-weight:600;color:#1e293b}
    .info-block .sub{font-size:12px;color:#64748b;margin-top:2px}

    /* ── Items Table ── */
    .items-table{width:100%;border-collapse:collapse;margin:18px 0}
    .items-table thead tr{background:linear-gradient(135deg,#1e293b,#334155)}
    .items-table thead th{padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#fff}
    .items-table thead th.num{text-align:right}
    .items-table tbody tr{border-bottom:1px solid #f1f5f9}
    .items-table tbody tr.even{background:#f8fafc}
    .items-table tbody td{padding:9px 12px;font-size:13px;color:#334155}
    .items-table tbody td.sno{color:#94a3b8;font-size:11px;width:32px}
    .items-table tbody td.num{text-align:right}
    .items-table tbody td.amt{font-weight:600;color:#1e293b}

    /* ── Totals ── */
    .totals{display:flex;justify-content:flex-end;margin-top:4px}
    .totals-inner{width:260px}
    .totals-row{display:flex;justify-content:space-between;padding:5px 0;font-size:13px;color:#475569}
    .totals-row.discount span:last-child{color:#10b981}
    .totals-row.grand{background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:8px;padding:10px 12px;margin-top:6px;font-size:15px;font-weight:800;color:#fff}

    /* ── Payment ── */
    .payment-row{display:flex;align-items:center;justify-content:space-between;margin-top:18px;padding:10px 14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0}
    .payment-row .method{font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 12px;border-radius:20px;background:#1e293b;color:#fff}

    /* ── Footer ── */
    .footer{margin-top:24px;padding-top:16px;border-top:1px dashed #cbd5e1;text-align:center}
    .footer p{font-size:11px;color:#94a3b8;line-height:1.8}
    .footer .thanks{font-size:14px;font-weight:700;color:#f59e0b;margin-bottom:4px}

    @media print{body{padding:16px}button{display:none}}
  </style>
</head>
<body>

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="logo-box">
        <svg viewBox="0 0 24 24"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>
      </div>
      <div>
        <div class="brand-name">Restro<span>Hub</span></div>
        <div class="brand-tag">Fine Dining &amp; Café</div>
      </div>
    </div>
    <div class="invoice-label">
      <h2>Tax Invoice</h2>
      <div class="inv-no">${bill.id}</div>
    </div>
  </div>

  <!-- Info Grid -->
  <div class="info-grid">
    <div>
      <div class="info-block">
        <div class="label">Billed To</div>
        <div class="value">${bill.customerName || 'Walk-in Guest'}</div>
        ${bill.customerPhone ? `<div class="sub">📞 ${bill.customerPhone}</div>` : ''}
      </div>
    </div>
    <div style="text-align:right">
      <div class="info-block">
        <div class="label">Invoice Details</div>
        <div class="value">${bill.tableName}</div>
        <div class="sub">${format(new Date(bill.createdAt), 'dd MMM yyyy, hh:mm a')}</div>
      </div>
    </div>
  </div>

  <!-- Items Table -->
  <table class="items-table">
    <thead>
      <tr>
        <th>#</th>
        <th>Item Description</th>
        <th class="num">Unit Price</th>
        <th class="num">Qty</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <!-- Totals -->
  <div class="totals">
    <div class="totals-inner">
      <div class="totals-row"><span>Subtotal</span><span>₹${Number(bill.subtotal).toFixed(2)}</span></div>
      <div class="totals-row"><span>Tax (${(bill.taxRate * 100).toFixed(0)}%)</span><span>₹${Number(bill.tax).toFixed(2)}</span></div>
      ${bill.discount > 0 ? `<div class="totals-row discount"><span>Discount</span><span>-₹${Number(bill.discount).toFixed(2)}</span></div>` : ''}
      <div class="totals-row grand"><span>TOTAL</span><span>₹${Number(bill.total).toFixed(2)}</span></div>
    </div>
  </div>

  <!-- Payment Method -->
  <div class="payment-row">
    <span style="font-size:12px;color:#64748b;font-weight:600">Payment Method</span>
    <span class="method">${(bill.paymentMethod || 'CASH').toUpperCase()}</span>
  </div>

  <!-- Footer -->
  <div class="footer">
    <p class="thanks">✦ Thank you for dining with us! ✦</p>
    <p>Please visit again · RestroHub · All prices inclusive of applicable taxes</p>
    <p>This is a computer-generated invoice and does not require a signature.</p>
  </div>

</body>
</html>`;
}

/* ── Bill Detail Modal ─────────────────────────────────────────────────────── */
function BillDetailModal({ bill, onClose }) {
  if (!bill) return null;

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=720,height=800');
    w.document.write(buildPrintHTML(bill));
    w.document.close();
    setTimeout(() => w.print(), 400);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-scale-in max-h-[92vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white rounded-t-2xl z-10 flex items-center justify-between px-5 py-4 border-b border-surface-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
              <UtensilsCrossed className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-surface-900 leading-tight">RestroHub</p>
              <p className="text-[10px] text-surface-400 font-mono leading-tight">{bill.id}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-900 hover:bg-surface-700 text-white text-xs font-semibold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 ml-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Receipt Body */}
        <div className="p-5 space-y-5">

          {/* Info Row */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Billed To</p>
              <p className="font-semibold text-surface-800">{bill.customerName || 'Walk-in Guest'}</p>
              {bill.customerPhone && <p className="text-surface-500 font-mono text-xs">📞 {bill.customerPhone}</p>}
            </div>
            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold uppercase tracking-widest text-surface-400">Invoice Details</p>
              <p className="font-semibold text-surface-800">{bill.tableName}</p>
              <p className="text-surface-500 text-xs">{format(new Date(bill.createdAt), 'dd MMM yyyy, hh:mm a')}</p>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-xl overflow-hidden border border-surface-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-900 text-white">
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-tl-xl">#</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Item</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Price</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider">Qty</th>
                  <th className="text-right px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-tr-xl">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {bill.items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-surface-50/60'}>
                    <td className="px-4 py-2.5 text-surface-400 text-xs">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-surface-800">{item.name}</td>
                    <td className="px-4 py-2.5 text-right text-surface-600">₹{Number(item.price || 0).toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right text-surface-600">{item.qty}</td>
                    <td className="px-4 py-2.5 text-right font-semibold text-surface-900">₹{Number(item.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-56 space-y-1.5 text-sm">
              <div className="flex justify-between text-surface-500">
                <span>Subtotal</span><span>₹{Number(bill.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-surface-500">
                <span>Tax ({(bill.taxRate * 100).toFixed(0)}%)</span><span>₹{Number(bill.tax).toFixed(2)}</span>
              </div>
              {bill.discount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount</span><span>-₹{Number(bill.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center bg-gradient-to-r from-primary-500 to-primary-600 text-white font-bold text-base px-3 py-2 rounded-xl mt-2">
                <span>TOTAL</span><span>₹{Number(bill.total).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Badge */}
          <div className="flex items-center justify-between bg-surface-50 rounded-xl px-4 py-3 border border-surface-100">
            <span className="text-xs text-surface-500 font-medium">Payment Method</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-surface-900 text-white uppercase tracking-wider">
              {bill.paymentMethod || 'cash'}
            </span>
          </div>

          {/* Thank you */}
          <p className="text-center text-xs text-surface-400 italic pt-1">
            ✦ Thank you for dining with us at <strong className="text-primary-500 not-italic">RestroHub</strong> ✦
          </p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Bills Page ───────────────────────────────────────────────────────── */
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

  const totalRevenue = filtered.reduce((s, b) => s + (b.total || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by ID, Table, Customer, or Phone…"
            className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-sm"
          />
        </div>
        <div className="flex items-center gap-3 text-sm text-surface-500">
          <span>{filtered.length} bills</span>
          {filtered.length > 0 && (
            <span className="font-semibold text-surface-800">₹{totalRevenue.toLocaleString()} total</span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="text-left text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3">Bill ID</th>
                <th className="text-left text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3">Table</th>
                <th className="text-left text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3">Customer</th>
                <th className="text-left text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3 hidden md:table-cell">Phone</th>
                <th className="text-left text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Date</th>
                <th className="text-right text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3">Amount</th>
                <th className="text-center text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Payment</th>
                <th className="text-right text-[11px] font-bold text-surface-400 uppercase tracking-wider px-5 py-3">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(bill => (
                <tr key={bill.id} className="hover:bg-surface-50/60 transition-colors">
                  <td className="px-5 py-3.5"><span className="text-xs font-mono text-surface-500">{bill.id}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm font-semibold text-surface-800">{bill.tableName}</span></td>
                  <td className="px-5 py-3.5"><span className="text-sm text-surface-700">{bill.customerName || <span className="text-surface-400 italic">Walk-in</span>}</span></td>
                  <td className="px-5 py-3.5 hidden md:table-cell"><span className="text-sm font-mono text-surface-500">{bill.customerPhone || '—'}</span></td>
                  <td className="px-5 py-3.5 hidden sm:table-cell"><span className="text-sm text-surface-500">{format(new Date(bill.createdAt), 'dd MMM, hh:mm a')}</span></td>
                  <td className="px-5 py-3.5 text-right"><span className="text-sm font-bold text-surface-900">₹{Number(bill.total).toLocaleString()}</span></td>
                  <td className="px-5 py-3.5 text-center hidden sm:table-cell">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide ${
                      bill.paymentMethod === 'card' ? 'bg-blue-50 text-blue-700' :
                      bill.paymentMethod === 'upi'  ? 'bg-purple-50 text-purple-700' :
                                                      'bg-green-50 text-green-700'
                    }`}>{bill.paymentMethod || 'cash'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => setSelectedBill(bill)}
                      className="p-1.5 rounded-lg hover:bg-primary-50 text-surface-400 hover:text-primary-600 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
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
