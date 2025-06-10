import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const inputVariants = cva(
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex w-full min-w-0 border bg-transparent text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      size: {
        default: "h-9 px-3 py-1 rounded-md file:h-7",
        sm: "h-8 px-2.5 py-1 rounded-sm text-xs file:h-6 file:text-xs",
        lg: "h-10 px-4 py-2 rounded-lg file:h-8",
        xl: "h-12 px-6 py-3 rounded-lg text-base file:h-10 file:text-base",
      },
      variant: {
        default: "",
        success:
          "border-green-500 focus-visible:border-green-600 focus-visible:ring-green-500/20",
        error:
          "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        warning:
          "border-yellow-500 focus-visible:border-yellow-600 focus-visible:ring-yellow-500/20",
      },
      radius: {
        default: "rounded-md",
        sm: "rounded-sm",
        lg: "rounded-lg",
        xl: "rounded-xl",
        none: "rounded-none",
        full: "rounded-full",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
      radius: "default",
    },
  }
);

interface InputProps
  extends Omit<React.ComponentProps<"input">, "size">,
    VariantProps<typeof inputVariants> {
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, size, variant, radius, startIcon, endIcon, ...props },
    ref
  ) => {
    if (startIcon || endIcon) {
      return (
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {startIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            data-slot="input"
            className={cn(
              inputVariants({ size, variant, radius }),
              startIcon && "pl-10",
              endIcon && "pr-10",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {endIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        data-slot="input"
        className={cn(inputVariants({ size, variant, radius, className }))}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

// Specialized Input Components
const PasswordInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type">
>(({ ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <Input
      {...props}
      ref={ref}
      type={showPassword ? "text" : "password"}
      endIcon={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          {showPassword ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464 19.536 19.536m-9.658-9.658l4.242 4.242"
              />
            </svg>
          ) : (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          )}
        </button>
      }
    />
  );
});

PasswordInput.displayName = "PasswordInput";

const SearchInput = React.forwardRef<
  HTMLInputElement,
  Omit<InputProps, "type">
>(({ ...props }, ref) => {
  return (
    <Input
      {...props}
      ref={ref}
      type="search"
      startIcon={
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      }
    />
  );
});

SearchInput.displayName = "SearchInput";

export { Input, PasswordInput, SearchInput, inputVariants };
export type { InputProps };
