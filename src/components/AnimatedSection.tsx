import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { cn } from '@/lib/utils';

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'left' | 'right' | 'scale';
}

export default function AnimatedSection({ children, className, delay = 0, direction = 'up' }: Props) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  const directionStyles = {
    up: 'translate-y-8',
    left: 'translate-x-8',
    right: '-translate-x-8',
    scale: 'scale-95',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'transition-all duration-700 ease-out',
        isVisible ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${directionStyles[direction]}`,
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
