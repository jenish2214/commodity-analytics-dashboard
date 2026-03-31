/**
 * Animated Card Component
 * ========================
 * Reusable card with smooth hover animations
 */

'use client';

import React, { memo, useRef, useCallback } from 'react';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'lift' | 'scale' | 'glow' | 'border' | 'tilt';
  onClick?: () => void;
  style?: React.CSSProperties;
}

// Mouse position for 3D tilt effect
interface MousePosition {
  x: number;
  y: number;
}

export const AnimatedCard = memo(function AnimatedCard({
  children,
  className = '',
  variant = 'lift',
  onClick,
  style,
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);

  // 3D tilt effect on mouse move
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (variant !== 'tilt' || !cardRef.current) return;

    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }

    rafRef.current = requestAnimationFrame(() => {
      const card = cardRef.current!;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${-rotateY}deg) translateZ(10px)`;
    });
  }, [variant]);

  const handleMouseLeave = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    if (cardRef.current && variant === 'tilt') {
      cardRef.current.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    }
  }, [variant]);

  // Get variant-specific styles
  const getVariantStyles = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      background: 'var(--bg-card)',
      borderRadius: '12px',
      padding: '1.5rem',
      border: '1px solid var(--border)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'transform 200ms cubic-bezier(0, 0, 0.2, 1), box-shadow 200ms cubic-bezier(0, 0, 0.2, 1)',
      willChange: 'transform, box-shadow',
      transformStyle: 'preserve-3d',
    };

    switch (variant) {
      case 'lift':
        return {
          ...base,
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 200ms ease-out',
        };
      case 'scale':
        return {
          ...base,
          transition: 'transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        };
      case 'glow':
        return {
          ...base,
          transition: 'box-shadow 200ms ease-out, border-color 200ms ease-out',
        };
      case 'border':
        return {
          ...base,
          position: 'relative',
          overflow: 'hidden',
        };
      case 'tilt':
        return {
          ...base,
          transition: 'transform 150ms ease-out',
        };
      default:
        return base;
    }
  };

  const getHoverStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'lift':
        return {
          transform: 'translateY(-8px)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.12)',
        };
      case 'scale':
        return {
          transform: 'scale(1.03)',
        };
      case 'glow':
        return {
          boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
          borderColor: 'var(--accent, #3b82f6)',
        };
      default:
        return {};
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      ref={cardRef}
      className={`animated-card ${variant} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
        ...(isHovered ? getHoverStyles() : {}),
      }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        handleMouseLeave();
      }}
      onMouseMove={handleMouseMove}
    >
      {/* Animated border for border variant */}
      {variant === 'border' && (
        <div
          className="animated-border"
          style={{
            position: 'absolute',
            inset: -2,
            borderRadius: 'inherit',
            padding: 2,
            background: 'linear-gradient(135deg, var(--accent), transparent, var(--accent))',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 200ms ease-out',
            pointerEvents: 'none',
          }}
        />
      )}
      {children}
    </div>
  );
});

// Animated Metric Card with number animation
interface AnimatedMetricCardProps {
  label: string;
  value: string;
  description: string;
  isPositive?: boolean;
  isNegative?: boolean;
  delay?: number;
}

export const AnimatedMetricCard = memo(function AnimatedMetricCard({
  label,
  value,
  description,
  isPositive,
  isNegative,
  delay = 0,
}: AnimatedMetricCardProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const color = isPositive ? '#22c55e' : isNegative ? '#ef4444' : 'var(--text-primary)';

  return (
    <div
      className="animated-metric-card"
      style={{
        background: 'var(--bg-hover)',
        borderRadius: '8px',
        padding: '1rem',
        border: '1px solid var(--border)',
        transition: 'all 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        transform: isHovered ? 'translateY(-4px) scale(1.02)' : isVisible ? 'scale(1)' : 'scale(0.9)',
        opacity: isVisible ? 1 : 0,
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.1)' : 'none',
        willChange: 'transform, opacity, box-shadow',
        cursor: 'default',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.25rem',
          transition: 'color 150ms ease-out',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color,
          marginBottom: '0.5rem',
          transition: 'transform 200ms ease-out, color 150ms ease-out',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          transition: 'color 150ms ease-out',
        }}
      >
        {description}
      </div>
    </div>
  );
});

// Staggered grid container
interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const StaggeredGrid = memo(function StaggeredGrid({
  children,
  className = '',
  style,
}: StaggeredGridProps) {
  return (
    <div
      className={`staggered-grid ${className}`}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        ...style,
      }}
    >
      {React.Children.map(children, (child, index) => (
        <div
          style={{
            animation: `fadeInUp 300ms ease-out ${index * 50}ms forwards`,
            opacity: 0,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});

// Keyframes for the component
const keyframes = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject keyframes
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = keyframes;
  document.head.appendChild(style);
}
