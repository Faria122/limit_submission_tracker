'use client';

import Chip from '@mui/material/Chip';

const STATUS_CONFIG = {
  new:       { label: 'New',       color: '#1565C0', bg: '#E3F2FD' },
  in_review: { label: 'In Review', color: '#E65100', bg: '#FFF3E0' },
  closed:    { label: 'Closed',    color: '#2E7D32', bg: '#E8F5E9' },
  lost:      { label: 'Lost',      color: '#6D4C41', bg: '#EFEBE9' },
} as const;

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#C62828', bg: '#FFEBEE' },
  medium: { label: 'Medium', color: '#F57F17', bg: '#FFFDE7' },
  low:    { label: 'Low',    color: '#558B2F', bg: '#F1F8E9' },
} as const;

export function StatusChip({ status }: { status: string }) {
  const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]
    ?? { label: status, color: '#616161', bg: '#F5F5F5' };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.04em',
        border: `1px solid ${cfg.color}33`,
        height: 22,
      }}
    />
  );
}

export function PriorityChip({ priority }: { priority: string }) {
  const cfg = PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]
    ?? { label: priority, color: '#616161', bg: '#F5F5F5' };
  return (
    <Chip
      label={cfg.label}
      size="small"
      sx={{
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontWeight: 700,
        fontSize: '0.7rem',
        letterSpacing: '0.04em',
        border: `1px solid ${cfg.color}33`,
        height: 22,
      }}
    />
  );
}
