import { cn } from '~/lib/utils/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
  padded?: boolean
}

export function Container({
  children,
  className,
  size = 'xl',
  padded = true,
  ...props
}: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-3xl',
    md: 'max-w-4xl',
    lg: 'max-w-5xl',
    xl: 'max-w-6xl',
    '2xl': 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div 
      className={cn(
        'w-full mx-auto px-4 sm:px-6 lg:px-8',
        sizeClasses[size],
        { 'py-8 sm:py-12': padded },
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export function Section({
  children,
  className,
  ...props
}: Omit<ContainerProps, 'size' | 'padded'>) {
  return (
    <section className={cn('py-16 sm:py-20', className)} {...props}>
      <Container>{children}</Container>
    </section>
  )
}
