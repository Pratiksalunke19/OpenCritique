import React from 'react';
import { cn } from '../../lib/utils';

/**
 * Card component with various styles and variants
 */
const Card = React.forwardRef(({ 
  className, 
  variant = 'default',
  hover = false,
  glow = false,
  glass = false,
  ...props 
}, ref) => {
  const variants = {
    default: 'bg-card text-card-foreground border border-border',
    gradient: 'gradient-card text-card-foreground border border-border',
    glass: 'glass text-card-foreground',
    outline: 'border-2 border-border bg-transparent text-foreground',
    solid: 'bg-primary text-primary-foreground border-0',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl shadow-lg transition-all duration-200',
        variants[variant],
        hover && 'hover-lift cursor-pointer',
        glow && 'hover-glow',
        glass && 'glass',
        className
      )}
      {...props}
    />
  );
});
Card.displayName = 'Card';

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-1.5 p-6', className)}
    {...props}
  />
));
CardHeader.displayName = 'CardHeader';

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-2xl font-heading font-semibold leading-none tracking-tight',
      className
    )}
    {...props}
  />
));
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-muted-foreground', className)}
    {...props}
  />
));
CardDescription.displayName = 'CardDescription';

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('p-6 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center p-6 pt-0', className)}
    {...props}
  />
));
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };