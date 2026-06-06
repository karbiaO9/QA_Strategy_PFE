"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utils/cn";

const avatarVariants = cva(
  "relative flex h-10 w-10 shrink-0 transition-colors bg-white",
  {
    variants: {
      variant: {
        circle: "rounded-full",
        rounded: "rounded-2xl",
      },
      borderColor: {
        primary: "border-primary-500",
        secondary: "border-secondary-500",
        success: "border-success-500",
        destructive: "border-red-500",
        warning: "border-yellow-500",
        info: "border-blue-500",
        primaryLight: "border-primary-50",
      },
    },
    defaultVariants: {
      variant: "circle",
      borderColor: "primary",
    },
  },
);

interface CustomAvatarProps
  extends
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>,
    Omit<VariantProps<typeof avatarVariants>, "borderColor"> {
  src?: string;
  fallbackText?: string;
  showBorder?: boolean;
  borderColor?: VariantProps<typeof avatarVariants>["borderColor"];
}

const CustomAvatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  CustomAvatarProps
>(
  (
    {
      className,
      variant,
      src,
      fallbackText,
      showBorder = false,
      borderColor,
      ...props
    },
    ref,
  ) => (
    <AvatarPrimitive.Root
      ref={ref}
      className={cn(
        avatarVariants({
          variant,
          borderColor: showBorder ? borderColor : undefined,
          className,
        }),
        showBorder && "border-[3px] p-[2.5px] bg-white",
        variant === "rounded" && showBorder && "border-[2px] p-[2px]",
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full overflow-hidden",
          variant === "circle" ? "rounded-full" : "rounded-xl",
        )}
      >
        <AvatarPrimitive.Image
          src={src}
          className="aspect-square h-full w-full object-cover"
        />
        <AvatarPrimitive.Fallback
          className={cn(
            "flex h-full w-full items-center justify-center bg-muted text-xs font-medium",
            variant === "circle" ? "rounded-full" : "rounded-xl",
          )}
        >
          {fallbackText || "U"}
        </AvatarPrimitive.Fallback>
      </div>
    </AvatarPrimitive.Root>
  ),
);
CustomAvatar.displayName = "CustomAvatar";

export { CustomAvatar };
