"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useTranslation } from "react-i18next";

export interface FormDialogProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  trigger?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  onCancel?: () => void;
  onConfirm?: () => void;
}

const FormDialog = ({
  trigger,
  title,
  children,
  onCancel,
  onConfirm,
  open,
  onOpenChange,
  ...props
}: FormDialogProps) => {
  const { t } = useTranslation();

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onConfirm) onConfirm();
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && <DialogPrimitive.Trigger asChild>{trigger}</DialogPrimitive.Trigger>}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-sm translate-x-[-50%] translate-y-[-50%] bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl border-none p-0 outline-none flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-4 border-b border-b-border flex justify-between items-center">
            <DialogPrimitive.Title className="text-xl font-medium leading-none tracking-tight">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="h-4 w-4 text-border flex items-center justify-center transition-opacity hover:opacity-80 outline-none">
              <span className="icon-close text-base"></span>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Body Content */}
          <div className="p-6 !pb-5">
            {children}
          </div>

          {/* Footer */}
          <div className="flex px-6 pb-6 pt-2 flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-0 outline-none">
            <DialogPrimitive.Close asChild>
              <button 
                className="w-full px-4 py-2 border border-input text-input-foreground rounded-xl"
                onClick={handleCancel}
              >
                Annuler
              </button>
            </DialogPrimitive.Close>
            
            <button 
              className="w-full px-4 py-2 border bg-primary text-white rounded-xl"
              onClick={handleConfirm}
            >
              Enregistrer
            </button>
          </div>

        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { FormDialog };
