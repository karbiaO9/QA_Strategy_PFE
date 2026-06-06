import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@physio-connect-frontend/shared-ui";

// ==============================
// Types
// ==============================
type TabsVariant = "primary" | "secondary" | "neutral";

type SessionTabsTriggerProps =
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    variant?: TabsVariant;
  };

// ==============================
// Variant styles
// ==============================
const triggerVariants: Record<TabsVariant, string> = {
  primary: "bg-primary text-white",
  secondary: "bg-[#8A7EE2] text-white",
  neutral: "bg-white text-[#414246] border border-border",
};

// ==============================
// Root
// ==============================
const SessionTabs = TabsPrimitive.Root;

// ==============================
// Tabs List (WITH GAP)
// ==============================
const SessionTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex w-full h-[130px] items-center justify-center gap-10 rounded-xl bg-white overflow-hidden",
      className
    )}
    {...props}
  />
));
SessionTabsList.displayName = TabsPrimitive.List.displayName;

// ==============================
// Tabs Trigger (FIXED VERSION)
// ==============================
const SessionTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  SessionTabsTriggerProps
>(({ className, variant = "primary", children, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "group relative flex-1 inline-flex items-center justify-center min-w-[132px] min-h-[120px] text-2xl font-medium transition-all duration-300 ease-out",
      "focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
      "rounded-xl",

      // variant
      triggerVariants[variant],

      // =========================
      // LEFT semi-circle
      // =========================
      "before:content-[''] before:absolute before:top-1/2 before:-translate-y-1/2 before:-left-2 before:w-4 before:h-4 before:rounded-full before:z-0",

      // =========================
      // RIGHT semi-circle
      // =========================
      "after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:-right-2 after:w-4 after:h-4 after:rounded-full after:z-0",

      // =========================
      // COLORS
      // =========================
      variant === "primary" && "before:bg-primary after:bg-primary",
      variant === "secondary" && "before:bg-[#8A7EE2] after:bg-[#8A7EE2]",
      variant === "neutral" &&
        "before:bg-white before:border-l before:border-border after:bg-white after:border-r after:border-border",

      // =========================
      // HIDE OUTER EDGES
      // =========================
      "first:before:hidden",
      "last:after:hidden", // FIX: Hides the right semi-circle on the last trigger

      className
    )}
    {...props}
  >
    {/* 🔗 CONNECTION LINE (NEW — separate element) */}
    <span
      className={cn(
        "pointer-events-none absolute top-1/2 left-full -translate-y-1/2 translate-x-0 h-[7px] w-10",
        "group-last:hidden", // FIX: Hides this line when the trigger (.group) is the last child

        variant === "primary" && "bg-primary",
        variant === "secondary" && "bg-[#8A7EE2]",
        variant === "neutral" && "bg-white border border-border"
      )}
    />

    {/* 🔵 ACTIVE INDICATOR */}
    <span
      className={cn(
        "absolute top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full",
        "opacity-0 scale-0 transition-all duration-300 ease-out",
        "group-data-[state=active]:opacity-100 group-data-[state=active]:scale-100",
        variant === "primary" && "bg-white",
        variant === "secondary" && "bg-white",
        variant === "neutral" && "bg-[#414246]"
      )}
    />

    {/* Content */}
    <span className="relative z-10">{children}</span>
  </TabsPrimitive.Trigger>
));
SessionTabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

// ==============================
// Tabs Content
// ==============================
const SessionTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn("mt-6 focus-visible:outline-none", className)}
    {...props}
  />
));
SessionTabsContent.displayName = TabsPrimitive.Content.displayName;

// ==============================
// Export
// ==============================
export {
  SessionTabs,
  SessionTabsList,
  SessionTabsTrigger,
  SessionTabsContent,
};