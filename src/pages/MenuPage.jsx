import { useState } from 'react';
import { Plus, Search, Edit3, Trash2, X, Check, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import ConfirmDialog from '../components/ConfirmDialog';
import { uploadMenuImage } from '../lib/supabase';

const CATEGORIES = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];

function AddItemModal({ open, onClose, onPreview }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Main Course');
  const [image, setImage] = useState('');
  const [uploading, setUploading] = useState(false);

  if (!open) return null;

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadMenuImage(file);
      if (url) setImage(url);
    } catch (err) {
      console.warn('Image upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !price || uploading) return;
    onPreview({
      name: name.trim(),
      price: Number(price),
      category,
      image: image.trim() || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
    });
    setName(''); setPrice(''); setCategory('Main Course'); setImage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Add Menu Item</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Item Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paneer Tikka" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-sm" autoFocus required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Price (₹)</label>
              <input type="number" min={1} value={price} onChange={e => setPrice(e.target.value)} placeholder="249" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all text-sm" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-600 mb-1.5">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all bg-white text-sm">
                {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Item Image</label>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {image ? (
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-surface-200 bg-surface-50 flex-shrink-0">
                    <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImage('')} className="absolute top-0.5 right-0.5 p-0.5 bg-black/60 text-white rounded-full hover:bg-black">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-xl border-2 border-dashed border-surface-200 flex items-center justify-center text-surface-400 bg-surface-50 flex-shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}
                <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-surface-200 hover:border-primary-300 rounded-xl text-sm font-medium text-surface-700 bg-surface-50 hover:bg-primary-50/50 transition-all">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary-600" /> : <Upload className="w-4 h-4 text-primary-600" />}
                  <span>{uploading ? 'Uploading image…' : 'Upload Image File'}</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                </label>
              </div>
              <input value={image} onChange={e => setImage(e.target.value)} placeholder="Or paste image URL (https://…)" className="w-full px-3 py-1.5 border border-surface-200 rounded-xl text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-xs" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-surface-200 rounded-xl text-surface-600 font-medium hover:bg-surface-50 transition-colors text-sm">Cancel</button>
            <button type="submit" disabled={uploading} className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20 text-sm disabled:opacity-50">Add Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function MenuPage() {
  const { menuItems, addMenuItem, updateMenuItem, removeMenuItem } = useStore();
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Confirm dialogs
  const [confirmDelete, setConfirmDelete] = useState(null); // item object
  const [confirmToggle, setConfirmToggle] = useState(null); // item object
  const [confirmEdit,   setConfirmEdit]   = useState(null); // { id, oldValues, newValues }
  const [pendingItem,   setPendingItem]   = useState(null); // item to confirm adding

  const filtered = menuItems.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCat;
  });

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({ name: item.name, price: item.price, category: item.category, image: item.image || '' });
  };

  // Stages the edit for confirmation — does NOT save yet
  const requestSaveEdit = (item) => {
    setConfirmEdit({
      id: item.id,
      oldValues: { name: item.name, price: item.price, category: item.category, image: item.image || '' },
      newValues: { ...editValues },
    });
  };

  const commitSaveEdit = () => {
    if (!confirmEdit) return;
    updateMenuItem(confirmEdit.id, confirmEdit.newValues);
    setEditingId(null);
    setConfirmEdit(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items…" className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all bg-white text-sm" />
        </div>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20">
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-primary-500 text-white shadow-md shadow-primary-500/20' : 'bg-white border border-surface-200 text-surface-600 hover:border-primary-200 hover:text-primary-600'}`}>
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50/50">
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Item</th>
                <th className="text-left text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3 hidden sm:table-cell">Category</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Price</th>
                <th className="text-center text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-surface-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-surface-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    {editingId === item.id ? (
                      <div className="space-y-1.5 max-w-xs">
                        <input value={editValues.name} onChange={e => setEditValues(v => ({...v, name: e.target.value}))} placeholder="Item name" className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm w-full focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                        <div className="flex items-center gap-2">
                          <input value={editValues.image || ''} onChange={e => setEditValues(v => ({...v, image: e.target.value}))} placeholder="Image URL" className="px-2.5 py-1 border border-surface-200 rounded-lg text-xs flex-1 focus:outline-none focus:ring-2 focus:ring-primary-500/30 text-surface-600" />
                          <label className="cursor-pointer p-1.5 border border-surface-200 hover:border-primary-300 rounded-lg text-xs text-primary-600 bg-surface-50 hover:bg-primary-50 flex items-center justify-center" title="Upload new image">
                            <Upload className="w-3.5 h-3.5" />
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const url = await uploadMenuImage(file);
                                if (url) setEditValues(v => ({ ...v, image: url }));
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-surface-100 flex-shrink-0 border border-surface-200">
                          <img
                            src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80'}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            onError={e => {
                              e.target.onerror = null;
                              e.target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80';
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-surface-800">{item.name}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-surface-100 text-surface-600">{item.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {editingId === item.id ? (
                      <input type="number" value={editValues.price} onChange={e => setEditValues(v => ({...v, price: Number(e.target.value)}))} className="px-3 py-1.5 border border-surface-200 rounded-lg text-sm w-24 text-right focus:outline-none focus:ring-2 focus:ring-primary-500/30" />
                    ) : (
                      <span className="text-sm font-semibold text-surface-800">₹{item.price}</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-center">
                    <button
                      onClick={() => setConfirmToggle(item)}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${item.available ? 'bg-green-50 text-green-600 hover:bg-green-100' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {editingId === item.id ? (
                        <>
                          <button
                            onClick={() => requestSaveEdit(item)}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            title="Save changes"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors"><X className="w-4 h-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(item)} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-surface-600 transition-colors"><Edit3 className="w-4 h-4" /></button>
                          <button onClick={() => setConfirmDelete(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-400 hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="px-5 py-12 text-center text-surface-400 text-sm">No items found.</div>}
      </div>

      <AddItemModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onPreview={(data) => { setShowAdd(false); setPendingItem(data); }}
      />

      {/* Confirm: Add new menu item */}
      <ConfirmDialog
        open={!!pendingItem}
        title="Add this item to the menu?"
        message={`"${pendingItem?.name}" · ₹${pendingItem?.price} · ${pendingItem?.category}`}
        confirmLabel="Add to Menu"
        cancelLabel="Go Back"
        variant="primary"
        onConfirm={() => { addMenuItem(pendingItem); setPendingItem(null); }}
        onCancel={() => { setPendingItem(null); setShowAdd(true); }}
      />

      {/* Confirm: Delete menu item */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove menu item?"
        message={`"${confirmDelete?.name}" will be permanently removed from the menu.`}
        confirmLabel="Remove Item"
        variant="danger"
        onConfirm={() => { removeMenuItem(confirmDelete.id); setConfirmDelete(null); }}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Confirm: Toggle availability */}
      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.available ? 'Mark as unavailable?' : 'Mark as available?'}
        message={
          confirmToggle?.available
            ? `"${confirmToggle?.name}" will be hidden from the ordering menu until made available again.`
            : `"${confirmToggle?.name}" will be visible and orderable again.`
        }
        confirmLabel={confirmToggle?.available ? 'Mark Unavailable' : 'Mark Available'}
        variant={confirmToggle?.available ? 'warning' : 'info'}
        onConfirm={() => { updateMenuItem(confirmToggle.id, { available: !confirmToggle.available }); setConfirmToggle(null); }}
        onCancel={() => setConfirmToggle(null)}
      />

      {/* Confirm: Save edited item */}
      <ConfirmDialog
        open={!!confirmEdit}
        title="Save changes to menu item?"
        message={
          confirmEdit
            ? (() => {
                const o = confirmEdit.oldValues;
                const n = confirmEdit.newValues;
                const changes = [];
                if (o.name !== n.name)       changes.push(`Name: "${o.name}" → "${n.name}"`);
                if (o.price !== n.price)     changes.push(`Price: ₹${o.price} → ₹${n.price}`);
                if (o.category !== n.category) changes.push(`Category: ${o.category} → ${n.category}`);
                return changes.length > 0 ? changes.join('\n') : 'No changes detected.';
              })()
            : ''
        }
        confirmLabel="Save Changes"
        cancelLabel="Keep Editing"
        variant="warning"
        onConfirm={commitSaveEdit}
        onCancel={() => setConfirmEdit(null)}
      />
    </div>
  );
}
