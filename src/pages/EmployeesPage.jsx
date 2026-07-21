import { useState } from 'react';
import { Plus, Trash2, X, UserCheck, UserX, ChefHat, ConciergeBell } from 'lucide-react';
import { useStore } from '../context/StoreContext';

const ROLES = ['chef', 'waiter', 'cashier', 'manager'];
const roleIcons = { chef: ChefHat, waiter: ConciergeBell, cashier: UserCheck, manager: UserCheck };

function AddEmployeeModal({ open, onClose, onAdd }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('chef');
  if (!open) return null;
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), email: email.trim(), role });
    setName(''); setEmail(''); setRole('chef');
    onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100">
          <h3 className="text-lg font-semibold text-surface-900">Add Employee</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ravi Kumar" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" autoFocus required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="ravi@restrohub.com" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl text-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-400 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-600 mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={`py-2.5 rounded-xl text-sm font-medium capitalize transition-all ${role === r ? 'bg-primary-500 text-white shadow-md' : 'bg-surface-50 border border-surface-200 text-surface-600 hover:border-primary-200'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-surface-200 rounded-xl text-surface-600 font-medium hover:bg-surface-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20">Add Employee</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EmployeesPage() {
  const { employees, addEmployee, removeEmployee, updateEmployee } = useStore();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <p className="text-surface-500 text-sm">{employees.length} employees</p>
        <button onClick={() => setShowAdd(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold text-sm rounded-xl hover:from-primary-600 hover:to-primary-700 transition-all shadow-md shadow-primary-500/20">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((emp, idx) => {
          const RoleIcon = roleIcons[emp.role] || UserCheck;
          return (
            <div key={emp.id} className="bg-white rounded-2xl border border-surface-200 p-5 hover:shadow-lg hover:shadow-surface-200/50 transition-all duration-300 animate-slide-up" style={{ animationDelay: `${idx * 60}ms` }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                    <RoleIcon className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-surface-800">{emp.name}</h3>
                    <p className="text-xs text-surface-400">{emp.email || 'No email'}</p>
                  </div>
                </div>
                <button onClick={() => removeEmployee(emp.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-surface-300 hover:text-danger transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-surface-100 text-surface-600 capitalize">{emp.role}</span>
                <button onClick={() => updateEmployee(emp.id, { status: emp.status === 'active' ? 'inactive' : 'active' })}
                  className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${emp.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {emp.status === 'active' ? <><UserCheck className="w-3 h-3" /> Active</> : <><UserX className="w-3 h-3" /> Inactive</>}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-surface-100 flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-surface-300" />
          </div>
          <h3 className="text-lg font-semibold text-surface-700">No employees yet</h3>
          <p className="text-surface-400 mt-1 text-sm">Add chefs, waiters, and other staff.</p>
        </div>
      )}

      <AddEmployeeModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={addEmployee} />
    </div>
  );
}
