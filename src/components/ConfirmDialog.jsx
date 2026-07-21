import { AlertTriangle, Info, AlertCircle, X } from 'lucide-react';

const variants = {
  danger: {
    icon: AlertTriangle,
    iconBg: 'bg-red-50',
    iconColor: 'text-red-500',
    confirmBtn: 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/20',
  },
  warning: {
    icon: AlertCircle,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-500',
    confirmBtn: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20',
  },
  info: {
    icon: Info,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-500',
    confirmBtn: 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20',
  },
  primary: {
    icon: Info,
    iconBg: 'bg-primary-50',
    iconColor: 'text-primary-500',
    confirmBtn: 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white shadow-primary-500/20',
  },
};

/**
 * ConfirmDialog — reusable confirmation modal
 *
 * Props:
 *  open       boolean     — controls visibility
 *  title      string      — dialog heading
 *  message    string|node — body text
 *  confirmLabel string   — label for confirm button (default "Confirm")
 *  cancelLabel  string   — label for cancel button  (default "Cancel")
 *  variant    'danger' | 'warning' | 'info' | 'primary'  (default 'danger')
 *  onConfirm  () => void  — called when user confirms
 *  onCancel   () => void  — called when user cancels / closes
 */
export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  const v = variants[variant] || variants.danger;
  const Icon = v.icon;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 animate-fade-in"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-0">
          <div className={`w-10 h-10 rounded-xl ${v.iconBg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${v.iconColor}`} />
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-surface-100 text-surface-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-4 pb-6">
          <h3 className="text-base font-semibold text-surface-900 mb-1">{title}</h3>
          {message && (
            <p className="text-sm text-surface-500 leading-relaxed">{message}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-surface-200 rounded-xl text-surface-600 text-sm font-medium hover:bg-surface-50 transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={() => { onConfirm(); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold shadow-md transition-all ${v.confirmBtn}`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
