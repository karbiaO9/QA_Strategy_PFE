"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "../utils/cn";
import { Button } from "./button";
import { cva, type VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";
import "../i18n";

const headerVariants = cva(
  "flex flex-col space-y-1.5 p-6 rounded-t-3xl",
  {
    variants: {
      color: {
        primary: "bg-primary-500 text-white",
        secondary: "bg-secondary-500 text-white",
        success: "bg-success-500 text-white",
        destructive: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white",
        white: "bg-white text-gray-900 border-b border-gray-100",
      },
    },
    defaultVariants: {
      color: "primary",
    },
  }
);

const buttonVariantsColor = {
  primary: "default" as const, // Maps to primary button
  secondary: "secondary" as const,
  success: "default" as const, // Might need a custom class or stick to default
  destructive: "destructive" as const,
  warning: "secondary" as const,
  info: "secondary" as const,
  white: "default" as const,
};

export interface DialogModalProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  trigger?: React.ReactNode;
  /**
   * Title displayed in the modal header
   */
  title: string;
  /**
   * Content inside the modal
   */
  children: React.ReactNode;
  /**
   * Color theme for the header and the save button
   */
  color?: VariantProps<typeof headerVariants>["color"];
  /**
   * Text for the cancel button
   */
  cancelText?: string;
  /**
   * Handler for the cancel button
   */
  onCancel?: () => void;
  /**
   * Text for the save/confirm button
   */
  confirmText?: string;
  /**
   * Handler for the save/confirm button
   */
  onConfirm?: () => void;
  /**
   * Optional boolean to disable the save button (e.g. during submission)
   */
  isConfirmDisabled?: boolean;
}

const DialogModal = ({
  trigger,
  title,
  children,
  color = "primary",
  cancelText,
  onCancel,
  confirmText,
  onConfirm,
  isConfirmDisabled,
  open,
  onOpenChange,
  ...props
}: DialogModalProps) => {
  const { t } = useTranslation();

  const handleCancel = (e: React.MouseEvent) => {
    if (onCancel) onCancel();
    if (onOpenChange) onOpenChange(false);
  };

  const handleConfirm = (e: React.MouseEvent) => {
    // If onConfirm handler is explicitly provided, execute custom fallback logic
    if (onConfirm) {
      e.preventDefault();
      onConfirm();
    }
    // If no onConfirm exists, it falls through naturally to execute native form submission
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange} {...props}>
      {trigger && 
        <DialogPrimitive.Trigger asChild className="bg-primary">{trigger}</DialogPrimitive.Trigger>
      }
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] bg-white shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl border-none p-0 outline-none flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className={cn(headerVariants({ color }), "flex-row justify-between items-center")}>
            <DialogPrimitive.Title className="text-xl text-white font-semibold leading-none tracking-tight">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Close className="h-6 w-6 flex items-center justify-center transition-opacity hover:opacity-70 outline-none">
              <span className="icon-close text-[20px]"></span>
              <span className="sr-only">Close</span>
            </DialogPrimitive.Close>
          </div>

          {/* Body Content */}
          <div className="p-6">
            {children}
          </div>

          {/* Footer */}
          <div className="flex px-6 pb-6 pt-2 flex-col-reverse sm:flex-row sm:justify-end gap-3 sm:space-x-0 outline-none">
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="w-full rounded-xl text-md text-gray-400 font-medium h-12 border-border hover:text-gray-500"
                onClick={handleCancel}
              >
                {cancelText ?? t("dialog.cancel")}
              </Button>
            </DialogPrimitive.Close>
            
            <Button
              type="submit"
              form="dialog-form"
              variant={buttonVariantsColor[color ?? "primary"]}
              size="lg"
              className={cn(
                "w-full rounded-xl text-md font-medium h-12",
                color === "success" && "bg-success-500 hover:bg-success-600 text-white",
                color === "info" && "bg-blue-500 hover:bg-blue-600 text-white",
                color === "warning" && "bg-yellow-500 hover:bg-yellow-600 text-white"
              )}
              onClick={handleConfirm}
              disabled={isConfirmDisabled}
            >
              {confirmText ?? t("dialog.save")}
            </Button>
          </div>

        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};

export { DialogModal };
