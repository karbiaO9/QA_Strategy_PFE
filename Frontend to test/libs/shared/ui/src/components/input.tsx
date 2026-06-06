import * as React from "react";
import { cn } from "../utils/cn";

interface InputProps extends React.ComponentProps<"input"> {
  leftIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted">
            {leftIcon}
          </div>
        )}

        <input
          type={type}
          ref={ref}
          className={cn(
            "flex h-12 w-full rounded-xl border border-input bg-white px-4 py-2.5 text-base placeholder:text-foreground-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            leftIcon && "pl-10",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };