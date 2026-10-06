import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        success: "bg-success-light text-success",
        danger: "bg-danger-light text-danger",
        warning: "bg-warning-light text-warning",
        info: "bg-info-light text-info",
        neutral: "bg-muted text-secondary-foreground",
        primary: "bg-primary-light text-primary",
        // Nombres heredados de shadcn, mapeados a la paleta nueva.
        default: "bg-primary-light text-primary",
        secondary: "bg-muted text-secondary-foreground",
        destructive: "bg-danger-light text-danger",
        outline: "border border-border bg-card text-foreground",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

type BadgeVariant = "success" | "danger" | "warning" | "info" | "neutral" | "primary"

function Badge({
  className,
  variant = "neutral",
  dot = false,
  asChild = false,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean; dot?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {dot && (
            <span aria-hidden className="size-1.5 shrink-0 rounded-full bg-current" />
          )}
          {children}
        </>
      )}
    </Comp>
  )
}

export { Badge, badgeVariants }
export type { BadgeVariant }
