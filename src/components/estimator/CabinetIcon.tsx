import React from 'react';
import type { CabinetImageType } from '@/lib/estimator/types';

interface CabinetIconProps {
  type?: CabinetImageType;
  size?: number;
  className?: string;
}

const STROKE = 'currentColor';
const SW = 1.5;

function Wall1D({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 28" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="32" height="22" rx="1" />
      <line x1="4" y1="9" x2="36" y2="9" />
      <line x1="20" y1="9" x2="20" y2="25" strokeDasharray="2 1.5" />
      <circle cx="18" cy="17" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function Wall2D({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 28" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="36" height="22" rx="1" />
      <line x1="2" y1="9" x2="38" y2="9" />
      <line x1="20" y1="9" x2="20" y2="25" />
      <circle cx="17" cy="17" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="23" cy="17" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function WallCorner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 28" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3 L22 3 L38 14 L22 25 L2 25 Z" />
      <line x1="2" y1="9" x2="22" y2="9" />
      <circle cx="13" cy="17" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function Base1D({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="32" height="26" rx="1" />
      <rect x="4" y="28" width="32" height="6" rx="1" />
      <line x1="4" y1="11" x2="36" y2="11" />
      <line x1="20" y1="11" x2="20" y2="28" strokeDasharray="2 1.5" />
      <rect x="7" y="4" width="26" height="7" rx="0.5" opacity="0.3" fill={STROKE} stroke="none" />
      <circle cx="18" cy="19" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function Base2D({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="36" height="26" rx="1" />
      <rect x="2" y="28" width="36" height="6" rx="1" />
      <line x1="2" y1="11" x2="38" y2="11" />
      <line x1="20" y1="11" x2="20" y2="28" />
      <rect x="4" y="4" width="34" height="7" rx="0.5" opacity="0.3" fill={STROKE} stroke="none" />
      <circle cx="16" cy="19" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="24" cy="19" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function BaseDrawers({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="32" height="28" rx="1" />
      <rect x="4" y="30" width="32" height="4" rx="1" />
      <line x1="4" y1="10.5" x2="36" y2="10.5" />
      <line x1="4" y1="19" x2="36" y2="19" />
      <circle cx="20" cy="6" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="20" cy="14.5" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="20" cy="23" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function BaseSink({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="36" height="26" rx="1" />
      <rect x="2" y="28" width="36" height="6" rx="1" />
      <line x1="2" y1="2" x2="38" y2="2" />
      <line x1="20" y1="2" x2="20" y2="28" />
      <ellipse cx="20" cy="13" rx="9" ry="7" strokeDasharray="2 1.5" />
      <circle cx="16" cy="22" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="24" cy="22" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function BaseCorner({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 2 L36 2 L36 22 L20 30 L4 22 Z" />
      <rect x="4" y="30" width="32" height="4" rx="1" />
      <line x1="4" y1="9" x2="36" y2="9" />
      <circle cx="20" cy="19" r="5" strokeDasharray="2 1.5" />
      <circle cx="20" cy="19" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function BaseLazySusan({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="36" height="28" rx="1" />
      <rect x="2" y="30" width="36" height="4" rx="1" />
      <circle cx="20" cy="16" r="10" />
      <circle cx="20" cy="16" r="5" strokeDasharray="2 1.5" />
      <circle cx="20" cy="16" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function Tall({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 48" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="28" height="44" rx="1" />
      <line x1="2" y1="24" x2="30" y2="24" />
      <line x1="16" y1="24" x2="16" y2="46" />
      <line x1="16" y1="2" x2="16" y2="24" strokeDasharray="2 1.5" />
      <circle cx="13" cy="13" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="13" cy="35" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="19" cy="35" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function Vanity({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 30" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="36" height="20" rx="1" />
      <rect x="2" y="24" width="36" height="4" rx="1" />
      <line x1="2" y1="12" x2="38" y2="12" />
      <line x1="20" y1="12" x2="20" y2="24" />
      <rect x="5" y="5" width="30" height="7" rx="0.5" opacity="0.3" fill={STROKE} stroke="none" />
      <circle cx="16" cy="18" r="1.5" fill={STROKE} stroke="none" />
      <circle cx="24" cy="18" r="1.5" fill={STROKE} stroke="none" />
    </svg>
  );
}

function Specialty({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 36" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="32" height="30" rx="1" />
      <rect x="4" y="32" width="32" height="2" rx="0.5" />
      <line x1="4" y1="10" x2="36" y2="10" />
      <line x1="4" y1="22" x2="36" y2="22" />
      <circle cx="20" cy="6" r="2" fill={STROKE} stroke="none" opacity="0.5" />
      <circle cx="20" cy="16" r="3" strokeDasharray="2 1.5" />
      <circle cx="20" cy="27" r="2" fill={STROKE} stroke="none" opacity="0.5" />
    </svg>
  );
}

function Accessory({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 28" fill="none" stroke={STROKE} strokeWidth={SW} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="32" height="20" rx="1" strokeDasharray="3 2" />
      <line x1="4" y1="14" x2="36" y2="14" strokeDasharray="2 2" />
      <circle cx="20" cy="9" r="2" fill={STROKE} stroke="none" opacity="0.4" />
      <circle cx="20" cy="19" r="2" fill={STROKE} stroke="none" opacity="0.4" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.FC<{ size: number }>> = {
  'wall-1d': Wall1D,
  'wall-2d': Wall2D,
  'wall-corner': WallCorner,
  'base-1d': Base1D,
  'base-2d': Base2D,
  'base-drawers': BaseDrawers,
  'base-sink': BaseSink,
  'base-corner': BaseCorner,
  'base-ls': BaseLazySusan,
  'tall': Tall,
  'vanity': Vanity,
  'specialty': Specialty,
  'accessory': Accessory,
};

export default function CabinetIcon({ type, size = 36, className }: CabinetIconProps) {
  const Icon = type ? (ICON_MAP[type] ?? Accessory) : Accessory;
  return (
    <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <Icon size={size} />
    </span>
  );
}
