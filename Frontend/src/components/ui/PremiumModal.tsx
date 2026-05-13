import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Info
} from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName?: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  isLoading
}: ConfirmDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-card rounded-2xl shadow-xl">
        <div className="relative p-6 flex flex-col items-center text-center">
          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
            <Trash2 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 px-4">
            {description}
            {itemName && (
              <span className="block mt-1 font-bold text-gray-900 dark:text-white italic">
                "{itemName}"
              </span>
            )}
          </p>

          <div className="flex flex-col w-full gap-2">
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              variant="destructive"
              className="h-12 w-full font-bold rounded-xl transition-all active:scale-95"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
            </Button>
            
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="h-12 w-full font-bold text-gray-500 rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface StatusModalProps {
  isOpen: boolean;
  status: 'loading' | 'success' | 'error';
  title: string;
  message?: string;
  onClose?: () => void;
}

export function StatusModal({
  isOpen,
  status,
  title,
  message,
  onClose
}: StatusModalProps) {
  const config = {
    loading: {
      icon: Loader2,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-500/10',
      spin: true
    },
    success: {
      icon: CheckCircle2,
      color: 'text-[#8CE600]',
      bgColor: 'bg-[#8CE600]/5 dark:bg-[#8CE600]/10',
      spin: false
    },
    error: {
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 dark:bg-red-500/10',
      spin: false
    }
  };

  const current = config[status];
  const Icon = current.icon;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && status !== 'loading' && onClose?.()}>
      <DialogContent className="sm:max-w-[360px] p-0 overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-card rounded-2xl shadow-xl">
        <div className="p-8 flex flex-col items-center text-center">
          <motion.div
            key={status}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`w-20 h-20 rounded-2xl ${current.bgColor} flex items-center justify-center ${current.color} mb-6`}
          >
            <Icon className={`w-10 h-10 ${current.spin ? 'animate-spin' : ''}`} />
          </motion.div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          
          {message && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {message}
            </p>
          )}

          {status !== 'loading' && onClose && (
            <Button
              onClick={onClose}
              className="mt-6 h-11 px-8 bg-gray-900 dark:bg-white text-white dark:text-gray-950 font-bold rounded-xl transition-all"
            >
              Fechar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface ActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
  title: string;
  description: string;
  actionText: string;
  variant?: 'default' | 'premium' | 'danger';
  icon?: React.ElementType;
  isLoading?: boolean;
}

export function ActionModal({
  isOpen,
  onClose,
  onAction,
  title,
  description,
  actionText,
  variant = 'default',
  icon: Icon = Info,
  isLoading
}: ActionModalProps) {
  const variantStyles = {
    default: 'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
    premium: 'bg-[#8CE600] text-gray-950',
    danger: 'bg-red-500 text-white'
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-gray-100 dark:border-white/10 bg-white dark:bg-card rounded-2xl shadow-xl">
        <div className="p-6 flex flex-col items-center text-center">
          <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center ${
            variant === 'premium' ? 'bg-[#8CE600]/10 text-[#8CE600]' : 
            variant === 'danger' ? 'bg-red-50 dark:bg-red-500/10 text-red-500' : 
            'bg-gray-100 dark:bg-white/5 text-gray-500'
          }`}>
            <Icon className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">
            {title}
          </h2>
          
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="ghost"
              onClick={onClose}
              disabled={isLoading}
              className="h-12 font-bold rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              onClick={onAction}
              disabled={isLoading}
              className={`h-12 font-bold rounded-xl transition-all active:scale-95 ${variantStyles[variant]}`}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : actionText}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
