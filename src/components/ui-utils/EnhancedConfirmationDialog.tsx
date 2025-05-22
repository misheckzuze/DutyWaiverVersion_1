'use client';
import React from 'react';
import Button from '@/components/ui/button/Button';
import { 
  CheckCircleIcon, 
  AlertIcon, 
  InfoIcon, 
  ErrorIcon,
  CloseIcon
} from '@/icons';

interface EnhancedConfirmationDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  type?: 'success' | 'warning' | 'danger' | 'info';
  showIcon?: boolean;
}

const EnhancedConfirmationDialog: React.FC<EnhancedConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isSubmitting = false,
  type = 'warning',
  showIcon = true,
}) => {
  if (!isOpen) return null;

  // Define styles based on type
  const typeStyles = {
    success: {
      icon: <CheckCircleIcon className="w-12 h-12 text-success-500" />,
      confirmButtonClass: 'bg-success-500 hover:bg-success-600 text-white',
      title: title || 'Success',
      borderClass: 'border-success-200'
    },
    warning: {
      icon: <AlertIcon className="w-12 h-12 text-warning-500" />,
      confirmButtonClass: 'bg-warning-500 hover:bg-warning-600 text-white',
      title: title || 'Warning',
      borderClass: 'border-warning-200'
    },
    danger: {
      icon: <ErrorIcon className="w-12 h-12 text-error-500" />,
      confirmButtonClass: 'bg-error-500 hover:bg-error-600 text-white',
      title: title || 'Confirmation',
      borderClass: 'border-error-200'
    },
    info: {
      icon: <InfoIcon className="w-12 h-12 text-blue-500" />,
      confirmButtonClass: 'bg-blue-500 hover:bg-blue-600 text-white',
      title: title || 'Information',
      borderClass: 'border-blue-200'
    }
  };

  const currentStyle = typeStyles[type];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md p-6 border ${currentStyle.borderClass} transform transition-all animate-fadeIn`}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            {currentStyle.title}
          </h2>
          <button 
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex flex-col items-center mb-6">
          {showIcon && (
            <div className="mb-4">
              {currentStyle.icon}
            </div>
          )}
          <p className="text-center text-gray-700 dark:text-gray-300">
            {message}
          </p>
        </div>
        
        <div className="flex justify-center gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300 px-5"
            disabled={isSubmitting}
          >
            {cancelText}
          </Button>
          <Button
            onClick={onConfirm}
            className={`${currentStyle.confirmButtonClass} px-5`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EnhancedConfirmationDialog;
