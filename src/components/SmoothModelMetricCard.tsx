/**
 * Smooth Model Metric Card
 * ==========================
 * Drop-in replacement for ModelMetricCard with fluid animations
 */

'use client';

import React, { memo, useState, useCallback } from 'react';

interface ModelMetricCardProps {
  label: string;
  value: string | number;
  description: string;
  isPositive?: boolean;
  isNegative?: boolean;
  index?: number; // For staggered animation
  onClick?: () => void;
}

export const SmoothModelMetricCard = memo(function SmoothModelMetricCard({
  label,
  value,
  description,
  isPositive,
  isNegative,
  index = 0,
  onClick,
}: ModelMetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
    setIsPressed(false);
  }, []);
  const handleMouseDown = useCallback(() => setIsPressed(true), []);
  const handleMouseUp = useCallback(() => setIsPressed(false), []);

  // Determine color based on props
  const getColor = () => {
    if (isPositive) return '#22c55e';
    if (isNegative) return '#ef4444';
    return 'var(--text-primary)';
  };

  // Format value
  const formattedValue = typeof value === 'number' ? value.toFixed(3) : value;

  // Calculate transform based on state
  const getTransform = () => {
    if (isPressed) return 'translateY(-2px) scale(0.98)';
    if (isHovered) return 'translateY(-6px) scale(1.03)';
    return 'translateY(0) scale(1)';
  };

  // Calculate box shadow
  const getBoxShadow = () => {
    if (isPressed) return '0 4px 12px rgba(0, 0, 0, 0.1)';
    if (isHovered) return '0 12px 32px rgba(0, 0, 0, 0.15)';
    return '0 2px 8px rgba(0, 0, 0, 0.04)';
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{
        background: 'var(--bg-hover)',
        borderRadius: '12px',
        padding: '1.25rem',
        border: `1px solid ${isHovered ? 'var(--accent)' : 'var(--border)'}`,
        cursor: onClick ? 'pointer' : 'default',
        transform: getTransform(),
        boxShadow: getBoxShadow(),
        opacity: 1,
        transition: `
          transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1),
          box-shadow 250ms cubic-bezier(0, 0, 0.2, 1),
          border-color 200ms ease-out,
          background-color 200ms ease-out
        `,
        willChange: 'transform, box-shadow',
        animation: `fadeInUp 400ms ease-out ${index * 60}ms backwards`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Shimmer effect on hover */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: isHovered ? '100%' : '-100%',
          width: '50%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          transition: 'left 600ms ease-out',
          pointerEvents: 'none',
        }}
      />

      {/* Label */}
      <div
        style={{
          fontSize: '0.75rem',
          color: isHovered ? 'var(--accent)' : 'var(--text-secondary)',
          marginBottom: '0.5rem',
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'color 200ms ease-out',
        }}
      >
        {label}
      </div>

      {/* Value */}
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          color: getColor(),
          marginBottom: '0.5rem',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          transition: 'transform 250ms cubic-bezier(0.34, 1.56, 0.64, 1), color 150ms ease-out',
          transformOrigin: 'left center',
        }}
      >
        {formattedValue}
      </div>

      {/* Description */}
      <div
        style={{
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          opacity: isHovered ? 1 : 0.8,
          transition: 'opacity 200ms ease-out',
        }}
      >
        {description}
      </div>

      {/* Subtle indicator dot */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          background: getColor(),
          opacity: isHovered ? 1 : 0.3,
          transform: isHovered ? 'scale(1.5)' : 'scale(1)',
          transition: 'all 200ms ease-out',
        }}
      />
    </div>
  );
});

// Compact version for smaller spaces
export const CompactSmoothCard = memo(function CompactSmoothCard({
  label,
  value,
  description,
  isPositive,
  isNegative,
  index = 0,
}: Omit<ModelMetricCardProps, 'onClick'>) {
  const [isHovered, setIsHovered] = useState(false);

  const getColor = () => {
    if (isPositive) return '#22c55e';
    if (isNegative) return '#ef4444';
    return 'var(--text-primary)';
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: 'var(--bg-hover)',
        borderRadius: '8px',
        padding: '1rem',
        border: `1px solid ${isHovered ? 'var(--accent)' : 'var(--border)'}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0, 0, 0, 0.1)' : 'none',
        transition: 'all 200ms cubic-bezier(0, 0, 0.2, 1)',
        willChange: 'transform, box-shadow',
        animation: `fadeInUp 300ms ease-out ${index * 50}ms backwards`,
      }}
    >
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          marginBottom: '0.25rem',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: '1.25rem',
          fontWeight: 700,
          color: getColor(),
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: '0.7rem',
          color: 'var(--text-secondary)',
          marginTop: '0.25rem',
        }}
      >
        {description}
      </div>
    </div>
  );
});

// CSS for animations (injected)
const cardStyles = `
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

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .smooth-card {
    animation: none !important;
    transition: opacity 0.01ms !important;
  }
  
  .smooth-card:hover {
    transform: none !important;
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleId = 'smooth-card-styles';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = cardStyles;
    document.head.appendChild(style);
  }
}

export default SmoothModelMetricCard;
