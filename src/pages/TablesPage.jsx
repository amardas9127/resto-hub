import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Users as UsersIcon, X, UtensilsCrossed } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ConfirmDialog from '../components/ConfirmDialog';

function AddTableModal({ open, onClose, onPreview }) {
  const [name, setName] = useState('');
  const [seats, setSeats] = useState(4);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onPreview({ name: name.trim(), seats: Number(seats) });
    setName('');
    setSeats(4);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Add New Table</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Table Name</label>
            <input
              id="table-name-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Table 5, VIP Booth"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
              autoFocus
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Number of Seats</label>
            <input
              id="table-seats-input"
              type="number"
              min={1}
              max={20}
              value={seats}
              onChange={e => setSeats(e.target.value)}
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-surface-200 rounded-xl text-surface-600 font-medium hover:bg-surface-50 transition-colors">
              Cancel
            </button>
            <button
              id="add-table-submit"
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20"
            >
              Add Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TablesPage() {
  const { tables, addTable, removeTable, orders, kitchenOrders } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null); // table object
  const [pendingTable, setPendingTable]   = useState(null); // table to confirm adding
  const navigate = useNavigate();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-surface-500 text-sm">
            {tables.length} tables • {tables.filter(t => t.status === 'occupied').length} occupied
          </p>
        </div>
        <button
          id="add-table-btn"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20"
        >
          <Plus className="w-4 h-4" />
          Add Table
        </button>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {tables.map((table, idx) => {
          const tableOrder = orders[table.id] || [];
          const activeKos = kitchenOrders.filter(o => String(o.tableId) === String(table.id) && !o.billed);
          const isOccupied = table.status === 'occupied';

          const koItemCount = activeKos.reduce((s, ko) => s + (ko.items || []).reduce((is, item) => is + item.qty, 0), 0);
          const koTotal = activeKos.reduce((s, ko) => s + (ko.items || []).reduce((is, item) => is + (item.price || 0) * item.qty, 0), 0);
          const cartItemCount = tableOrder.reduce((s, o) => s + o.qty, 0);
          const cartTotal = tableOrder.reduce((s, o) => s + o.item.price * o.qty, 0);

          const itemCount = koItemCount + cartItemCount;
          const orderTotal = koTotal + cartTotal;

          return (
            <div
              key={table.id}
              className={`
                group relative bg-white rounded-2xl border-2 p-5 cursor-pointer
                transition-all duration-300 hover:shadow-xl hover:-translate-y-1
                animate-slide-up
                ${isOccupied
                  ? 'border-primary-300 bg-gradient-to-br from-primary-50 to-white shadow-md shadow-primary-100'
                  : 'border-surface-200 hover:border-primary-200'
                }
              `}
              style={{ animationDelay: `${idx * 50}ms` }}
              onClick={() => navigate(`/orders/${table.id}`)}
            >
              {/* Delete button */}
              {!isOccupied && (
                <button
                  onClick={e => { e.stopPropagation(); setConfirmRemove(table); }}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-surface-300 hover:text-danger transition-all"
                  title="Remove table"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              {/* Table info */}
              <div className="text-center">
                <div
                  className={`
                    w-14 h-14 mx-auto rounded-2xl flex items-center justify-center mb-3 transition-colors
                    ${isOccupied
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-surface-100 text-surface-400 group-hover:bg-primary-50 group-hover:text-primary-500'
                    }
                  `}
                >
                  <UtensilsCrossed className="w-6 h-6" />
                </div>

                <h3 className="font-semibold text-surface-800 text-sm truncate">
                  {table.name}
                </h3>

                <div className="flex items-center justify-center gap-1 mt-1 text-surface-400">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span className="text-xs">{table.seats} seats</span>
                </div>

                {/* Status badge */}
                <span
                  className={`
                    inline-block mt-3 text-xs font-semibold px-3 py-1 rounded-full
                    ${isOccupied
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-green-50 text-green-600'
                    }
                  `}
                >
                  {isOccupied ? `${itemCount} items • ₹${orderTotal}` : 'Available'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {tables.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-surface-300" />
          </div>
          <h3 className="text-lg font-semibold text-surface-700">No tables yet</h3>
          <p className="text-surface-400 mt-1 text-sm">Add your first table to get started.</p>
        </div>
      )}

      <AddTableModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onPreview={(data) => { setShowAdd(false); setPendingTable(data); }}
      />

      {/* Confirm: Add new table */}
      <ConfirmDialog
        open={!!pendingTable}
        title="Add this table?"
        message={`Create "${pendingTable?.name}" with ${pendingTable?.seats} seat${pendingTable?.seats !== 1 ? 's' : ''}?`}
        confirmLabel="Add Table"
        cancelLabel="Go Back"
        variant="primary"
        onConfirm={() => { addTable(pendingTable); setPendingTable(null); }}
        onCancel={() => { setPendingTable(null); setShowAdd(true); }}
      />

      {/* Confirm: Remove table */}
      <ConfirmDialog
        open={!!confirmRemove}
        title="Remove this table?"
        message={`"${confirmRemove?.name}" will be permanently removed. Any associated orders will also be cleared.`}
        confirmLabel="Remove Table"
        variant="danger"
        onConfirm={() => { removeTable(confirmRemove.id); setConfirmRemove(null); }}
        onCancel={() => setConfirmRemove(null)}
      />
    </div>
  );
}
