import { Button, ButtonProps } from "@/libs/components/ui/button";
import { cn } from "@/libs/utils/string";
import { Loader2 } from "lucide-react";
import * as React from "react";

export interface LoadingButtonProps extends ButtonProps {
  isLoading?: boolean;
}

const LoadingButton = React.forwardRef<HTMLButtonElement, LoadingButtonProps>(
  ({ children, isLoading, disabled, className, ...props }, ref) => {
    return (
      <Button
        className={cn(className, "relative")}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </Button>
    );
  },
);
LoadingButton.displayName = "LoadingButton";

export { LoadingButton };
