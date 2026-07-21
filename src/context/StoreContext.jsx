import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, deleteMenuImage } from '../lib/supabase';
import toast from 'react-hot-toast';

const StoreContext = createContext(null);

// Maps DB snake_case rows -> camelCase JS objects for display
function mapKitchenOrder(row) {
  return {
    id:        row.id,
    tableId:   row.tableid   || row.tableId,
    tableName: row.tablename || row.tableName || '',
    items:     row.items || [],
    status:    row.status,
    billed:    row.billed,
    createdAt: row.createdat || row.createdAt || new Date().toISOString(),
  };
}

function mapBill(row) {
  return {
    id:            row.id,
    tableId:       row.tableid       || row.tableId,
    tableName:     row.tablename     || row.tableName || '',
    customerName:  row.customername  || row.customerName || '',
    customerPhone: row.customerphone || row.customerPhone || '',
    items:         row.items || [],
    subtotal:      row.subtotal,
    tax:           row.tax,
    taxRate:       row.taxrate       || row.taxRate || 0.05,
    discount:      row.discount || 0,
    total:         row.total,
    paymentMethod: row.paymentmethod || row.paymentMethod || 'cash',
    createdAt:     row.createdat     || row.createdAt || new Date().toISOString(),
  };
}

export function StoreProvider({ children }) {
  const [tables,        setTables]        = useState([]);
  const [menuItems,     setMenuItems]     = useState([]);
  const [employees,     setEmployees]     = useState([]);
  const [orders,        setOrders]        = useState({});
  const [bills,         setBills]         = useState([]);
  const [kitchenOrders, setKitchenOrders] = useState([]);
  const [storeLoading,  setStoreLoading]  = useState(true);

  // Initial load from Supabase
  useEffect(() => {
    async function initialLoad() {
      try {
        const [tRes, mRes, kRes, bRes, eRes, oRes] = await Promise.allSettled([
          supabase.from('tables').select('*').order('name'),
          supabase.from('menu_items').select('*').order('category').order('name'),
          supabase.from('kitchen_orders').select('*'),
          supabase.from('bills').select('*'),
          supabase.from('employees').select('*').order('name'),
          supabase.from('orders').select('*'),
        ]);

        if (tRes.status === 'fulfilled' && !tRes.value.error)
          setTables(tRes.value.data || []);
        if (mRes.status === 'fulfilled' && !mRes.value.error)
          setMenuItems(mRes.value.data || []);
        if (kRes.status === 'fulfilled' && !kRes.value.error) {
          const ko = (kRes.value.data || [])
            .map(mapKitchenOrder)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setKitchenOrders(ko);
        }
        if (bRes.status === 'fulfilled' && !bRes.value.error) {
          const bl = (bRes.value.data || [])
            .map(mapBill)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setBills(bl);
        }
        if (eRes.status === 'fulfilled' && !eRes.value.error)
          setEmployees(eRes.value.data || []);
        if (oRes.status === 'fulfilled' && !oRes.value.error) {
          const ordersMap = {};
          (oRes.value.data || []).forEach(row => {
            const key = row.tableid || row.tableId;
            ordersMap[key] = row.items || [];
          });
          setOrders(ordersMap);
        }
      } catch (err) {
        console.warn('Initial Supabase load error:', err);
      } finally {
        setStoreLoading(false);
      }
    }
    initialLoad();
  }, []);

  // Supabase Realtime subscriptions
  useEffect(() => {
    const kitchenChannel = supabase
      .channel('kitchen_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'kitchen_orders' }, async () => {
        const { data } = await supabase.from('kitchen_orders').select('*');
        if (data) {
          setKitchenOrders(
            data.map(mapKitchenOrder).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          );
        }
      })
      .subscribe();

    const ordersChannel = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
        const { data } = await supabase.from('orders').select('*');
        if (data) {
          const ordersMap = {};
          data.forEach(row => {
            const key = row.tableid || row.tableId;
            ordersMap[key] = row.items || [];
          });
          setOrders(ordersMap);
        }
      })
      .subscribe();

    const tablesChannel = supabase
      .channel('tables_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tables' }, async () => {
        const { data } = await supabase.from('tables').select('*').order('name');
        if (data) setTables(data);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(kitchenChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(tablesChannel);
    };
  }, []);

  // Persist cart orders to Supabase (snake_case keys for DB)
  const persistOrderToSupabase = useCallback(async (tableId, items) => {
    if (items.length === 0) {
      await supabase.from('orders').delete().eq('tableid', tableId);
    } else {
      await supabase.from('orders').upsert(
        { tableid: tableId, items },
        { onConflict: 'tableid' }
      );
    }
  }, []);

  // Table Operations
  const addTable = useCallback(async (table) => {
    const id = 'T' + Date.now();
    const newTable = { ...table, id, status: 'available' };
    const { error } = await supabase.from('tables').insert(newTable);
    if (error) { toast.error('Failed to add table: ' + error.message); return null; }
    setTables(prev => [...prev, newTable].sort((a, b) => a.name.localeCompare(b.name)));
    toast.success(table.name + ' added');
    return newTable;
  }, []);

  const removeTable = useCallback(async (tableId) => {
    const { error } = await supabase.from('tables').delete().eq('id', tableId);
    if (error) { toast.error('Failed to remove table: ' + error.message); return; }
    setTables(prev => prev.filter(t => t.id !== tableId));
    await supabase.from('orders').delete().eq('tableid', tableId);
    setOrders(prev => { const next = { ...prev }; delete next[tableId]; return next; });
    toast.success('Table removed');
  }, []);

  const updateTableStatus = useCallback(async (tableId, status) => {
    setTables(prev => prev.map(t => t.id === tableId ? { ...t, status } : t));
    await supabase.from('tables').update({ status }).eq('id', tableId);
  }, []);

  // Menu Operations
  const addMenuItem = useCallback(async (item) => {
    const id = 'M' + Date.now();
    const newItem = { ...item, id, available: true };
    const { error } = await supabase.from('menu_items').insert(newItem);
    if (error) { toast.error('Failed to add item: ' + error.message); return null; }
    setMenuItems(prev => [...prev, newItem]);
    toast.success(item.name + ' added to menu');
    return newItem;
  }, []);

  const updateMenuItem = useCallback(async (id, updates) => {
    const current = menuItems.find(i => i.id === id);
    if (updates.image && current?.image && updates.image !== current.image) {
      deleteMenuImage(current.image);
    }
    const { error } = await supabase.from('menu_items').update(updates).eq('id', id);
    if (error) { toast.error('Failed to update item: ' + error.message); return; }
    setMenuItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, [menuItems]);

  const removeMenuItem = useCallback(async (id) => {
    const target = menuItems.find(item => item.id === id);
    if (target?.image) deleteMenuImage(target.image);
    const { error } = await supabase.from('menu_items').delete().eq('id', id);
    if (error) { toast.error('Failed to remove item: ' + error.message); return; }
    setMenuItems(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from menu');
  }, [menuItems]);

  // Order Operations (cart per table)
  const addToOrder = useCallback(async (tableId, item, qty = 1) => {
    setOrders(prev => {
      const tableOrders = prev[tableId] || [];
      const existing = tableOrders.find(o => o.item.id === item.id);
      let updated;
      if (existing) {
        updated = tableOrders.map(o => o.item.id === item.id ? { ...o, qty: o.qty + qty } : o);
      } else {
        updated = [...tableOrders, { item, qty, addedAt: new Date().toISOString() }];
      }
      persistOrderToSupabase(tableId, updated);
      return { ...prev, [tableId]: updated };
    });
    await updateTableStatus(tableId, 'occupied');
  }, [updateTableStatus, persistOrderToSupabase]);

  const removeFromOrder = useCallback(async (tableId, itemId) => {
    setOrders(prev => {
      const tableOrders = (prev[tableId] || []).filter(o => o.item.id !== itemId);
      persistOrderToSupabase(tableId, tableOrders);
      if (tableOrders.length === 0) {
        const next = { ...prev }; delete next[tableId]; return next;
      }
      return { ...prev, [tableId]: tableOrders };
    });
  }, [persistOrderToSupabase]);

  const updateOrderQty = useCallback(async (tableId, itemId, qty) => {
    if (qty <= 0) { removeFromOrder(tableId, itemId); return; }
    setOrders(prev => {
      const tableOrders = (prev[tableId] || []).map(o => o.item.id === itemId ? { ...o, qty } : o);
      persistOrderToSupabase(tableId, tableOrders);
      return { ...prev, [tableId]: tableOrders };
    });
  }, [removeFromOrder, persistOrderToSupabase]);

  const clearOrder = useCallback(async (tableId) => {
    setOrders(prev => { const next = { ...prev }; delete next[tableId]; return next; });
    await supabase.from('orders').delete().eq('tableid', tableId);
  }, []);

  const sendToKitchen = useCallback(async (tableId) => {
    const tableOrders = orders[tableId];
    if (!tableOrders || tableOrders.length === 0) { toast.error('No items to send'); return; }
    const table = tables.find(t => String(t.id) === String(tableId));
    const id = 'KO' + Date.now();
    const items = tableOrders.map(o => ({ name: o.item.name, qty: o.qty, price: o.item.price }));

    // DB payload uses snake_case column names as actually stored in PostgreSQL
    const dbPayload = {
      id,
      tableid:   tableId,
      tablename: table?.name || tableId,
      items,
      status:    'pending',
      billed:    false,
    };

    const { error } = await supabase.from('kitchen_orders').insert(dbPayload);
    if (error) { toast.error('Failed to send to kitchen: ' + error.message); return; }

    // Local state uses camelCase for JS display
    const kitchenOrder = {
      id,
      tableId,
      tableName: table?.name || tableId,
      items,
      status:    'pending',
      billed:    false,
      createdAt: new Date().toISOString(),
    };
    setKitchenOrders(prev => [kitchenOrder, ...prev]);
    await updateTableStatus(tableId, 'occupied');
    await clearOrder(tableId);
    toast.success('Order sent to kitchen for ' + (table?.name || tableId));
  }, [orders, tables, clearOrder, updateTableStatus]);

  const updateKitchenOrderStatus = useCallback(async (orderId, status) => {
    const { error } = await supabase.from('kitchen_orders').update({ status }).eq('id', orderId);
    if (error) { toast.error('Failed to update status: ' + error.message); return; }
    setKitchenOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  // Bill Operations
  const generateBill = useCallback(async (tableId, extras = {}) => {
    const activeKitchenOrders = kitchenOrders.filter(
      o => String(o.tableId) === String(tableId) && !o.billed
    );
    const pendingCart = orders[tableId] || [];
    const allBillItems = [];
    activeKitchenOrders.forEach(ko => {
      (ko.items || []).forEach(item => {
        allBillItems.push({ name: item.name, price: item.price || 0, qty: item.qty, total: (item.price || 0) * item.qty });
      });
    });
    pendingCart.forEach(o => {
      allBillItems.push({ name: o.item.name, price: o.item.price, qty: o.qty, total: o.item.price * o.qty });
    });

    if (allBillItems.length === 0) { toast.error('No items to bill'); return null; }

    const table    = tables.find(t => String(t.id) === String(tableId));
    const subtotal = allBillItems.reduce((sum, o) => sum + o.total, 0);
    const taxRate  = extras.taxRate || 0.05;
    const tax      = Math.round(subtotal * taxRate);
    const discount = extras.discount || 0;
    const total    = subtotal + tax - discount;
    const id       = 'B' + Date.now();

    // DB payload: use snake_case column names as stored in PostgreSQL
    const billDb = {
      id,
      tableid:       tableId,
      tablename:     table?.name || tableId,
      customername:  extras.customerName || '',
      customerphone: extras.customerPhone || '',
      items:         allBillItems,
      subtotal, tax,
      taxrate:       taxRate,
      discount,
      total,
      paymentmethod: extras.paymentMethod || 'cash',
    };

    const { error: billError } = await supabase.from('bills').insert(billDb);
    if (billError) { toast.error('Failed to generate bill: ' + billError.message); return null; }

    // Local state: camelCase for JS display
    const bill = {
      id,
      tableId,
      tableName:     table?.name || tableId,
      customerName:  extras.customerName || '',
      customerPhone: extras.customerPhone || '',
      items:         allBillItems,
      subtotal, tax, taxRate, discount, total,
      paymentMethod: extras.paymentMethod || 'cash',
      createdAt:     new Date().toISOString(),
    };

    const koIds = activeKitchenOrders.map(o => o.id);
    if (koIds.length > 0) {
      await supabase.from('kitchen_orders').update({ billed: true }).in('id', koIds);
      setKitchenOrders(prev => prev.map(o => koIds.includes(o.id) ? { ...o, billed: true } : o));
    }

    setBills(prev => [bill, ...prev]);
    await clearOrder(tableId);
    await updateTableStatus(tableId, 'available');
    toast.success('Bill generated — Rs.' + total);
    return bill;
  }, [orders, kitchenOrders, tables, clearOrder, updateTableStatus]);

  // Employee Operations
  const addEmployee = useCallback(async (emp) => {
    const id = 'E' + Date.now();
    const newEmp = { ...emp, id, status: 'active' };
    const { error } = await supabase.from('employees').insert(newEmp);
    if (error) { toast.error('Failed to add employee: ' + error.message); return null; }
    setEmployees(prev => [...prev, newEmp]);
    toast.success(emp.name + ' added as ' + emp.role);
    return newEmp;
  }, []);

  const removeEmployee = useCallback(async (id) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) { toast.error('Failed to remove employee: ' + error.message); return; }
    setEmployees(prev => prev.filter(e => e.id !== id));
    toast.success('Employee removed');
  }, []);

  const updateEmployee = useCallback(async (id, updates) => {
    const { error } = await supabase.from('employees').update(updates).eq('id', id);
    if (error) { toast.error('Failed to update employee: ' + error.message); return; }
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const value = {
    tables, menuItems, employees, orders, bills, kitchenOrders, storeLoading,
    addTable, removeTable, updateTableStatus,
    addMenuItem, updateMenuItem, removeMenuItem,
    addToOrder, removeFromOrder, updateOrderQty, clearOrder, sendToKitchen, updateKitchenOrderStatus,
    generateBill,
    addEmployee, removeEmployee, updateEmployee,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export const useStore = () => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
};
