"use client"

import * as React from "react"
import { cn } from "../utils/cn"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./collapsible"
import { ChevronDown } from "lucide-react"

type CustomCollapsibleProps = {
  title: React.ReactNode
  children: React.ReactNode
  defaultOpen?: boolean
  className?: string
}

export function CustomCollapsible({
  title,
  children,
  defaultOpen = false,
  className,
}: CustomCollapsibleProps) {
  // Use the defaultOpen prop to initialize state
  const [isOpen, setIsOpen] = React.useState(defaultOpen)

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn(
        "flex w-full flex-col gap-2 py-4 bg-success-50 border-l-4 border-primary",
        className
      )}
    >
      {/* Wrap the entire header in the Trigger */}
      <CollapsibleTrigger asChild>
        <div className="flex items-center justify-between gap-4 px-4 cursor-pointer hover:opacity-80 transition-opacity">
          <h4 className="text-base font-medium select-none">{title}</h4>
          
          <div
            className={cn(
              "flex size-6 items-center justify-center transition-transform duration-200",
              isOpen && "rotate-180"
            )}
          >
            <ChevronDown className="size-5 text-foreground-muted" />
            <span className="sr-only">Toggle details</span>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 animate-accordion-down">
        <div className="pt-2 text-sm text-foreground-muted">
           {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}