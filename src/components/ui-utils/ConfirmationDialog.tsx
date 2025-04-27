'use client';
import React from 'react';
import Button from '@/components/ui/button/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  confirmText?: string; // ✅ New - button text
  onConfirm: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title = 'Confirmation',        // Default title
  message,
  confirmText = 'Confirm',        // Default confirm button text
  onConfirm,
  onCancel,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          {title}
        </h2>
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          {message}
        </p>
        <div className="flex justify-end gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="border-gray-300"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
