import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from '../utils/cn'

const ToggleGroupTabs = TabsPrimitive.Root

const ToggleGroupTabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "inline-flex h-11 items-center justify-center rounded-xl border border-border bg-white",
      className
    )}
    {...props}
  />
))
ToggleGroupTabsList.displayName = TabsPrimitive.List.displayName

const ToggleGroupTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center whitespace-nowrap px-4 py-2.5 rounded-none first:rounded-l-xl last:rounded-r-xl border-r border-r-border last:border-none text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-primary data-[state=active]:text-white",
      className
    )}
    {...props}
  />
))
ToggleGroupTabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const ToggleGroupTabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "my-6 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
ToggleGroupTabsContent.displayName = TabsPrimitive.Content.displayName

export { ToggleGroupTabs, ToggleGroupTabsList, ToggleGroupTabsTrigger, ToggleGroupTabsContent }
