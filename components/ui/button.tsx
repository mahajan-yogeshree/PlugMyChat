import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[10px] border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-transform duration-150 ease-out outline-none select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:not-aria-[haspopup]:translate-y-[3px] disabled:pointer-events-none disabled:bg-paper-3 disabled:text-ink disabled:shadow-none aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[inset_0_1px_0_var(--glint),0_0_0_1px_var(--color-signal-deep),0_3px_0_var(--color-signal-deep)] hover:bg-signal-deep",
        outline:
          "border-border bg-background text-foreground shadow-[inset_0_1px_0_var(--glint),0_3px_0_var(--color-rule)] hover:bg-muted",
        secondary:
          "bg-secondary text-secondary-foreground shadow-[inset_0_1px_0_var(--glint),0_3px_0_var(--color-rule)] hover:bg-paper-3",
        ghost: "shadow-none hover:bg-muted hover:text-foreground",
        destructive: "bg-destructive/10 text-destructive shadow-none hover:bg-destructive/20",
        link: "text-primary underline-offset-4 shadow-none hover:underline",
      },
      size: {
        default: "h-[52px] gap-1.5 px-4",
        xs: "h-8 gap-1 px-2 text-xs shadow-none",
        sm: "h-11 gap-1 px-3 text-sm",
        lg: "h-[52px] gap-1.5 px-5",
        icon: "size-[52px]",
        "icon-xs": "size-8 shadow-none",
        "icon-sm": "size-10",
        "icon-lg": "size-[52px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
