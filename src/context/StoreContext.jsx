import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, deleteMenuImage } from '../lib/supabase';
import toast from 'react-hot-toast';

const StoreContext = createContext(null);

// ── Default demo data ──────────────────────────────────────
const DEFAULT_TABLES = [
  { id: 'T1', name: 'Table 1', seats: 4, status: 'available' },
  { id: 'T2', name: 'Table 2', seats: 2, status: 'available' },
  { id: 'T3', name: 'Table 3', seats: 6, status: 'available' },
  { id: 'T4', name: 'Table 4', seats: 4, status: 'available' },
];

const DEFAULT_MENU = [
  { id: 'M1', name: 'Margherita Pizza', price: 299, category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&auto=format&fit=crop&q=80' },
  { id: 'M2', name: 'Caesar Salad', price: 199, category: 'Starters', available: true, image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&auto=format&fit=crop&q=80' },
  { id: 'M3', name: 'Grilled Chicken', price: 399, category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=500&auto=format&fit=crop&q=80' },
  { id: 'M4', name: 'Pasta Carbonara', price: 349, category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=500&auto=format&fit=crop&q=80' },
  { id: 'M5', name: 'Garlic Bread', price: 149, category: 'Starters', available: true, image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500&auto=format&fit=crop&q=80' },
  { id: 'M6', name: 'Tomato Soup', price: 129, category: 'Starters', available: true, image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=500&auto=format&fit=crop&q=80' },
  { id: 'M7', name: 'Chocolate Brownie', price: 179, category: 'Desserts', available: true, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop&q=80' },
  { id: 'M8', name: 'Masala Chai', price: 49, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500&auto=format&fit=crop&q=80' },
  { id: 'M9', name: 'Cold Coffee', price: 129, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=500&auto=format&fit=crop&q=80' },
  { id: 'M10', name: 'Paneer Tikka', price: 249, category: 'Starters', available: true, image: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=500&auto=format&fit=crop&q=80' },
  { id: 'M11', name: 'Butter Chicken', price: 379, category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?w=500&auto=format&fit=crop&q=80' },
  { id: 'M12', name: 'Dal Makhani', price: 249, category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=80' },
  { id: 'M13', name: 'Naan', price: 49, category: 'Breads', available: true, image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=500&auto=format&fit=crop&q=80' },
  { id: 'M14', name: 'Biryani', price: 329, category: 'Main Course', available: true, image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop&q=80' },
  { id: 'M15', name: 'Gulab Jamun', price: 99, category: 'Desserts', available: true, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=80' },
  { id: 'M16', name: 'Fresh Lime Soda', price: 79, category: 'Beverages', available: true, image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500&auto=format&fit=crop&q=80' },
];

const DEFAULT_EMPLOYEES = [
  { id: 'E1', name: 'Ravi Kumar', role: 'chef', email: 'ravi@restrohub.com', status: 'active' },
  { id: 'E2', name: 'Priya Sharma', role: 'chef', email: 'priya@restrohub.com', status: 'active' },
  { id: 'E3', name: 'Amit Patel', role: 'waiter', email: 'amit@restrohub.com', status: 'active' },
];

function loadLocal(key, fallback) {
  try {
    const saved = localStorage.getItem(`restrohub_${key}`);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function saveLocal(key, value) {
  localStorage.setItem(`restrohub_${key}`, JSON.stringify(value));
}

export function StoreProvider({ children }) {
  const [tables, setTables] = useState(() => loadLocal('tables', DEFAULT_TABLES));
  const [menuItems, setMenuItems] = useState(() => {
    const loaded = loadLocal('menu', DEFAULT_MENU);
    return loaded.map(item => {
      const def = DEFAULT_MENU.find(d => d.id === item.id);
      return { ...item, image: item.image || (def ? def.image : '') };
    });
  });
  const [employees, setEmployees] = useState(() => loadLocal('employees', DEFAULT_EMPLOYEES));
  const [orders, setOrders] = useState(() => loadLocal('orders', {})); // { tableId: [{ item, qty }] }
  const [bills, setBills] = useState(() => loadLocal('bills', []));
  const [kitchenOrders, setKitchenOrders] = useState(() => loadLocal('kitchen_orders', []));

  // Initial sync from Supabase if connected
  useEffect(() => {
    async function syncFromSupabase() {
      try {
        const [tRes, mRes, kRes, bRes, eRes] = await Promise.allSettled([
          supabase.from('tables').select('*'),
          supabase.from('menu_items').select('*'),
          supabase.from('kitchen_orders').select('*').order('createdAt', { ascending: false }),
          supabase.from('bills').select('*').order('createdAt', { ascending: false }),
          supabase.from('employees').select('*'),
        ]);

        if (tRes.status === 'fulfilled' && tRes.value.data?.length) setTables(tRes.value.data);
        if (mRes.status === 'fulfilled' && mRes.value.data?.length) {
          const mergedMenu = mRes.value.data.map(item => {
            const def = DEFAULT_MENU.find(d => d.id === item.id);
            return {
              ...item,
              image: item.image || (def ? def.image : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80')
            };
          });
          setMenuItems(mergedMenu);
        }
        if (kRes.status === 'fulfilled' && kRes.value.data?.length) setKitchenOrders(kRes.value.data);
        if (bRes.status === 'fulfilled' && bRes.value.data?.length) setBills(bRes.value.data);
        if (eRes.status === 'fulfilled' && eRes.value.data?.length) setEmployees(eRes.value.data);
      } catch (err) {
        console.warn('Supabase fetch notice (using local cache):', err);
      }
    }
    syncFromSupabase();
    const interval = setInterval(syncFromSupabase, 3000);
    return () => clearInterval(interval);
  }, []);

  // Persist to localStorage
  useEffect(() => { saveLocal('tables', tables); }, [tables]);
  useEffect(() => { saveLocal('menu', menuItems); }, [menuItems]);
  useEffect(() => { saveLocal('employees', employees); }, [employees]);
  useEffect(() => { saveLocal('orders', orders); }, [orders]);
  useEffect(() => { saveLocal('bills', bills); }, [bills]);
  useEffect(() => { saveLocal('kitchen_orders', kitchenOrders); }, [kitchenOrders]);

  // ── Table Operations ──────────────────────────────────
  const addTable = useCallback((table) => {
    const id = `T${Date.now()}`;
    const newTable = { ...table, id, status: 'available' };
    setTables(prev => [...prev, newTable]);
    toast.success(`${table.name} added`);
    // Sync to Supabase
    supabase.from('tables').insert(newTable).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
    return newTable;
  }, []);

  const removeTable = useCallback((tableId) => {
    setTables(prev => prev.filter(t => t.id !== tableId));
    // Also remove any orders for that table
    setOrders(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
    toast.success('Table removed');
    supabase.from('tables').delete().eq('id', tableId).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  const updateTableStatus = useCallback((tableId, status) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    supabase.from('tables').update({ status }).eq('id', tableId).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  // ── Menu Operations ───────────────────────────────────
  const addMenuItem = useCallback((item) => {
    const id = `M${Date.now()}`;
    const newItem = { ...item, id, available: true };
    setMenuItems(prev => [...prev, newItem]);
    toast.success(`${item.name} added to menu`);
    supabase.from('menu_items').insert(newItem).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
    return newItem;
  }, []);

  const updateMenuItem = useCallback((id, updates) => {
    setMenuItems(prev => prev.map(item => {
      if (item.id === id) {
        // If image was changed, clean up old image from storage
        if (updates.image && item.image && updates.image !== item.image) {
          deleteMenuImage(item.image);
        }
        return { ...item, ...updates };
      }
      return item;
    }));
    supabase.from('menu_items').update(updates).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  const removeMenuItem = useCallback((id) => {
    setMenuItems(prev => {
      const target = prev.find(item => item.id === id);
      if (target?.image) {
        deleteMenuImage(target.image);
      }
      return prev.filter(item => item.id !== id);
    });
    toast.success('Item removed from menu');
    supabase.from('menu_items').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  // ── Order Operations ──────────────────────────────────
  const addToOrder = useCallback((tableId, item, qty = 1) => {
    setOrders(prev => {
      const tableOrders = prev[tableId] || [];
      const existing = tableOrders.find(o => o.item.id === item.id);
      let updated;
      if (existing) {
        updated = tableOrders.map(o =>
          o.item.id === item.id ? { ...o, qty: o.qty + qty } : o
        );
      } else {
        updated = [...tableOrders, { item, qty, addedAt: new Date().toISOString() }];
      }
      return { ...prev, [tableId]: updated };
    });
    updateTableStatus(tableId, 'occupied');
  }, [updateTableStatus]);

  const removeFromOrder = useCallback((tableId, itemId) => {
    setOrders(prev => {
      const tableOrders = (prev[tableId] || []).filter(o => o.item.id !== itemId);
      if (tableOrders.length === 0) {
        const next = { ...prev };
        delete next[tableId];
        return next;
      }
      return { ...prev, [tableId]: tableOrders };
    });
  }, []);

  const updateOrderQty = useCallback((tableId, itemId, qty) => {
    if (qty <= 0) {
      removeFromOrder(tableId, itemId);
      return;
    }
    setOrders(prev => {
      const tableOrders = (prev[tableId] || []).map(o =>
        o.item.id === itemId ? { ...o, qty } : o
      );
      return { ...prev, [tableId]: tableOrders };
    });
  }, [removeFromOrder]);

  const clearOrder = useCallback((tableId) => {
    setOrders(prev => {
      const next = { ...prev };
      delete next[tableId];
      return next;
    });
  }, []);

  const sendToKitchen = useCallback((tableId) => {
    const tableOrders = orders[tableId];
    if (!tableOrders || tableOrders.length === 0) {
      toast.error('No items to send');
      return;
    }
    const table = tables.find(t => String(t.id) === String(tableId));
    const kitchenOrder = {
      id: `KO${Date.now()}`,
      tableId,
      tableName: table?.name || tableId,
      items: tableOrders.map(o => ({
        name: o.item.name,
        qty: o.qty,
        price: o.item.price,
      })),
      status: 'pending',
      billed: false,
      createdAt: new Date().toISOString(),
    };
    setKitchenOrders(prev => [kitchenOrder, ...prev]);
    updateTableStatus(tableId, 'occupied');
    // Clear cart so a new round can be placed; table stays 'occupied'
    clearOrder(tableId);
    toast.success(`Order sent to kitchen for ${table?.name || tableId}`);
    // Sync to Supabase
    supabase.from('kitchen_orders').insert(kitchenOrder).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, [orders, tables, clearOrder, updateTableStatus]);

  const updateKitchenOrderStatus = useCallback((orderId, status) => {
    setKitchenOrders(prev =>
      prev.map(o => o.id === orderId ? { ...o, status } : o)
    );
    supabase.from('kitchen_orders').update({ status }).eq('id', orderId).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  // ── Bill Operations ───────────────────────────────────
  const generateBill = useCallback((tableId, extras = {}) => {
    const activeKitchenOrders = kitchenOrders.filter(o => String(o.tableId) === String(tableId) && !o.billed);
    const pendingCart = orders[tableId] || [];

    const allBillItems = [];
    activeKitchenOrders.forEach(ko => {
      (ko.items || []).forEach(item => {
        allBillItems.push({
          name: item.name,
          price: item.price || 0,
          qty: item.qty,
          total: (item.price || 0) * item.qty,
        });
      });
    });
    pendingCart.forEach(o => {
      allBillItems.push({
        name: o.item.name,
        price: o.item.price,
        qty: o.qty,
        total: o.item.price * o.qty,
      });
    });

    if (allBillItems.length === 0) {
      toast.error('No items to bill');
      return null;
    }

    const table = tables.find(t => String(t.id) === String(tableId));
    const subtotal = allBillItems.reduce((sum, o) => sum + o.total, 0);
    const taxRate = extras.taxRate || 0.05;
    const tax = Math.round(subtotal * taxRate);
    const discount = extras.discount || 0;
    const total = subtotal + tax - discount;

    const bill = {
      id: `B${Date.now()}`,
      tableId,
      tableName: table?.name || tableId,
      customerName: extras.customerName || '',
      customerPhone: extras.customerPhone || '',
      items: allBillItems,
      subtotal,
      tax,
      taxRate,
      discount,
      total,
      paymentMethod: extras.paymentMethod || 'cash',
      createdAt: new Date().toISOString(),
    };

    setBills(prev => [bill, ...prev]);
    setKitchenOrders(prev => prev.map(o => String(o.tableId) === String(tableId) ? { ...o, billed: true } : o));
    clearOrder(tableId);
    updateTableStatus(tableId, 'available');
    toast.success(`Bill generated — ₹${total}`);

    // Sync to Supabase
    supabase.from('bills').insert(bill).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });

    return bill;
  }, [orders, kitchenOrders, tables, clearOrder, updateTableStatus]);

  // ── Employee Operations ───────────────────────────────
  const addEmployee = useCallback((emp) => {
    const id = `E${Date.now()}`;
    const newEmp = { ...emp, id, status: 'active' };
    setEmployees(prev => [...prev, newEmp]);
    toast.success(`${emp.name} added as ${emp.role}`);
    supabase.from('employees').insert(newEmp).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
    return newEmp;
  }, []);

  const removeEmployee = useCallback((id) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success('Employee removed');
    supabase.from('employees').delete().eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  const updateEmployee = useCallback((id, updates) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    supabase.from('employees').update(updates).eq('id', id).then(({ error }) => {
      if (error) console.warn('Supabase sync error:', error.message);
    });
  }, []);

  const value = {
    // Data
    tables,
    menuItems,
    employees,
    orders,
    bills,
    kitchenOrders,
    // Table ops
    addTable,
    removeTable,
    updateTableStatus,
    // Menu ops
    addMenuItem,
    updateMenuItem,
    removeMenuItem,
    // Order ops
    addToOrder,
    removeFromOrder,
    updateOrderQty,
    clearOrder,
    sendToKitchen,
    updateKitchenOrderStatus,
    // Bill ops
    generateBill,
    // Employee ops
    addEmployee,
    removeEmployee,
    updateEmployee,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
