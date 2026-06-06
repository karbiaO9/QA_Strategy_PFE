"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast } from "sonner"
import { Info } from "lucide-react"
import i18n from "../i18n"
import { cn } from "../utils/cn"

export const showToast = (
  message: string = "La séance a été ajoutée à votre bibliothèque !",
  type: "success" | "error" | "info" | "warning" = "success",
  position: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left" = "top-right",
  className?: string,
  icon?: React.ReactNode
) => {
  const title = i18n.t(`toast.${type}`);
  
  toast[type](title, {
    description: message,
    icon: icon || <Info className="h-5 w-5" />,
    className: cn(
      className,
      type === "error" && "border-red-200 bg-red-50",
      type === "success" && "border-green-200 bg-green-50",
      type === "warning" && "border-yellow-200 bg-yellow-50",
      type === "info" && "border-blue-200 bg-blue-50"
    ),
    descriptionClassName: cn(
      type === "error" && "!text-red-600",
      type === "success" && "!text-green-600",
      type === "warning" && "!text-yellow-600",
      type === "info" && "!text-blue-600"
    ),
    // Note: Sonner typically handles position at the Toaster level.
    // If you need per-toast position, you might need multiple Toasters with different containerIds.
  })
}

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ position = "top-right", ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position={position}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg group-[.toaster]:rounded-2xl group-[.toaster]:px-6 group-[.toaster]:py-4 group-[.toaster]:flex group-[.toaster]:items-center group-[.toaster]:gap-3 group-[.toaster]:border",
          description: "group-[.toast]:text-current",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success:
            "group-[.toaster]:bg-success-50 group-[.toaster]:text-success-700 group-[.toaster]:border-success-500",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:text-red-700 group-[.toaster]:border-red-500",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-700 group-[.toaster]:border-blue-500",
          warning:
            "group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-700 group-[.toaster]:border-yellow-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
