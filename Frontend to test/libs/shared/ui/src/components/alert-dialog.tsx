"use client"

import * as React from "react"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"

import { cn } from "../utils/cn"
import { Button, buttonVariants } from "./button"

const AlertDialog = AlertDialogPrimitive.Root
const AlertDialogTrigger = AlertDialogPrimitive.Trigger
const AlertDialogPortal = AlertDialogPrimitive.Portal

const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
    ref={ref}
  />
))
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-none bg-white p-8 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-3xl",
        className
      )}
      {...props}
    />
  </AlertDialogPortal>
))
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName

const AlertDialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-4 text-center items-center justify-center",
      className
    )}
    {...props}
  />
)
AlertDialogHeader.displayName = "AlertDialogHeader"

const AlertDialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-center gap-3 sm:space-x-0 mt-8",
      className
    )}
    {...props}
  />
)
AlertDialogFooter.displayName = "AlertDialogFooter"

const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
))
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-base font-medium text-gray-900", className)}
    {...props}
  />
))
AlertDialogDescription.displayName =
  AlertDialogPrimitive.Description.displayName

const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Action
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(className)}
    {...props}
  />
))
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName

// --- CUSTOM ALERT COMPONENT ---

export interface CustomAlertProps {
  /** Optional trigger element (like a button) to open the dialog */
  trigger?: React.ReactNode;
  /** Required if controlled: whether the dialog is open */
  isOpen?: boolean;
  /** Required if controlled: callback when dialog opens/closes */
  onOpenChange?: (open: boolean) => void;
  
  /** Alert icon (e.g., <i className="icon icon-delete" /> or a Lucide icon) */
  icon: React.ReactNode;
  /** The main message text */
  description: string;
  
  /** Configures the color theme for the icon and primary button */
  color?: "primary" | "secondary" | "red" | "gray";
  
  /** Text for the cancel button. Defaults to "Annuler" */
  cancelText?: string;
  /** Fired when cancel button is clicked. You don't need this to close the dialog if not controlled. */
  onCancel?: () => void;
  
  /** Text for the confirm button. */
  confirmText: string;
  /** Fired when confirm button is clicked. */
  onConfirm: () => void;
}

const colorMap = {
  primary: {
    iconCircle: "border-primary-500 text-primary-500 bg-primary-50",
    buttonVariant: "default" as const, // Maps to bg-primary-600
  },
  secondary: {
    iconCircle: "border-secondary-500 text-secondary-500 bg-secondary-50",
    buttonVariant: "secondary" as const, // Maps to bg-secondary-600
  },
  red: {
    iconCircle: "border-red-500 text-red-500 bg-red-50",
    buttonVariant: "destructive" as const, // Maps to bg-error-600 (#FF383C)
  },
  gray: {
    iconCircle: "border-gray-500 text-gray-500 bg-gray-50",
    buttonVariant: "outline" as const,
  },
};

export function CustomAlert({
  trigger,
  isOpen,
  onOpenChange,
  icon,
  description,
  color = "red",
  cancelText = "Annuler",
  confirmText,
  onCancel,
  onConfirm,
}: CustomAlertProps) {
  const theme = colorMap[color] || colorMap.red;

  const handleConfirm = (e: React.MouseEvent) => {
    // If you don't call preventDefault, the dialog automatically closes.
    onConfirm();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>}
      <AlertDialogContent>
        <AlertDialogHeader>
          {/* Icon Circle */}
          <div
            className={cn(
              "flex h-20 w-20 items-center justify-center rounded-full border-[1.5px] mb-2",
              theme.iconCircle
            )}
          >
            <div className="text-3xl flex items-center justify-center scale-150 font-light">
              {icon}
            </div>
          </div>
          
          <AlertDialogTitle className="sr-only">Alerte</AlertDialogTitle>
          <AlertDialogDescription>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-[180px] rounded-xl text-md text-gray-500 font-medium h-12 border-border"
              onClick={onCancel}
            >
              {cancelText}
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant={theme.buttonVariant}
              size="lg"
              className="w-full sm:w-[180px] rounded-xl text-md font-medium h-12"
              onClick={handleConfirm}
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
}
