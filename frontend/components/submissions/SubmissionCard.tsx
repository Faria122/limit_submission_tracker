'use client';

import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';

import { PriorityChip, StatusChip } from '@/components/ui/StatusChip';
import { formatDistanceToNow } from '@/lib/utils/date';
import type { SubmissionListItem } from '@/lib/types';

function nameToColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 42%, 40%)`;
}

export function SubmissionCard({ submission }: { submission: SubmissionListItem }) {
  const router = useRouter();
  const initials = submission.owner?.fullName
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <Box
      onClick={() => router.push(`/submissions/${submission.id}`)}
      sx={{
        p: 2, mb: 1.5, borderRadius: 2,
        border: '1px solid', borderColor: 'divider',
        bgcolor: 'background.paper', cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.1s',
        '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.08)', transform: 'translateY(-1px)' },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.75 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {submission.company.legalName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {submission.company.industry} · {submission.company.headquartersCity}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
          <StatusChip status={submission.status} />
          <PriorityChip priority={submission.priority} />
        </Box>
      </Box>

      {/* Broker */}
      <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
        via <strong>{submission.broker.name}</strong>
      </Typography>

      {/* Latest note */}
      {submission.latestNote && (
        <Typography
          variant="caption" color="text.secondary"
          sx={{ display: 'block', mb: 1, fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          "{submission.latestNote.bodyPreview}" — {submission.latestNote.authorName},{' '}
          {formatDistanceToNow(submission.latestNote.createdAt)}
        </Typography>
      )}

      {/* Footer */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Chip icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '13px !important' }} />}
            label={submission.documentCount} size="small" variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }} />
          <Chip icon={<ChatBubbleOutlineIcon sx={{ fontSize: '13px !important' }} />}
            label={submission.noteCount} size="small" variant="outlined"
            sx={{ height: 20, fontSize: '0.7rem' }} />
        </Box>
        <Tooltip title={submission.owner?.fullName ?? 'Unassigned'}>
          <Avatar sx={{ width: 26, height: 26, fontSize: '0.65rem', fontWeight: 700,
            bgcolor: nameToColor(submission.owner?.fullName ?? '?') }}>
            {initials}
          </Avatar>
        </Tooltip>
      </Box>
    </Box>
  );
}
