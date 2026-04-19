'use client';

import { useRouter } from 'next/navigation';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import RemoveIcon from '@mui/icons-material/Remove';

import { StatusChip } from '@/components/ui/StatusChip';
import { formatDistanceToNow } from '@/lib/utils/date';
import type { SubmissionListItem } from '@/lib/types';

const PRIORITY_ICON = {
  high:   { Icon: KeyboardArrowUpIcon,   color: '#C62828' },
  medium: { Icon: RemoveIcon,            color: '#F57F17' },
  low:    { Icon: KeyboardArrowDownIcon, color: '#558B2F' },
} as const;

function nameToColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 42%, 40%)`;
}

export function SubmissionRow({ submission }: { submission: SubmissionListItem }) {
  const router = useRouter();
  const { Icon, color } =
    PRIORITY_ICON[submission.priority] ?? PRIORITY_ICON.medium;

  const initials = submission.owner?.fullName
    ?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <TableRow
      hover
      onClick={() => router.push(`/submissions/${submission.id}`)}
      sx={{ cursor: 'pointer', transition: 'background 0.12s' }}
    >
      <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip title={`Priority: ${submission.priority}`}>
            <Icon sx={{ fontSize: 18, color }} />
          </Tooltip>
          <StatusChip status={submission.status} />
        </Box>
      </TableCell>

      {/* Company name + industry/city */}
      <TableCell>
        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: 210 }}>
          {submission.company.legalName}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap>
          {submission.company.industry} · {submission.company.headquartersCity}
        </Typography>
      </TableCell>

      {/* Broker */}
      <TableCell>
        <Typography variant="body2" noWrap sx={{ maxWidth: 160 }}>
          {submission.broker.name}
        </Typography>
      </TableCell>

      {/* Latest note snippet */}
      <TableCell sx={{ maxWidth: 260 }}>
        {submission.latestNote ? (
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                fontSize: '0.8rem',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
              }}
            >
              {submission.latestNote.bodyPreview}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {submission.latestNote.authorName} · {formatDistanceToNow(submission.latestNote.createdAt)}
            </Typography>
          </Box>
        ) : (
          <Typography variant="caption" color="text.disabled" fontStyle="italic">
            No notes yet
          </Typography>
        )}
      </TableCell>

      {/* Doc + note count badges */}
      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Box sx={{ display: 'flex', gap: 0.75 }}>
          <Tooltip title={`${submission.documentCount} document${submission.documentCount !== 1 ? 's' : ''}`}>
            <Chip
              icon={<InsertDriveFileOutlinedIcon sx={{ fontSize: '13px !important' }} />}
              label={submission.documentCount}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.72rem', '& .MuiChip-label': { px: 0.7 } }}
            />
          </Tooltip>
          <Tooltip title={`${submission.noteCount} note${submission.noteCount !== 1 ? 's' : ''}`}>
            <Chip
              icon={<ChatBubbleOutlineIcon sx={{ fontSize: '13px !important' }} />}
              label={submission.noteCount}
              size="small"
              variant="outlined"
              sx={{ height: 22, fontSize: '0.72rem', '& .MuiChip-label': { px: 0.7 } }}
            />
          </Tooltip>
        </Box>
      </TableCell>

      {/* Owner avatar */}
      <TableCell>
        <Tooltip title={submission.owner?.fullName ?? 'Unassigned'}>
          <Avatar
            sx={{
              width: 30, height: 30, fontSize: '0.68rem', fontWeight: 700,
              bgcolor: nameToColor(submission.owner?.fullName ?? '?'),
            }}
          >
            {initials}
          </Avatar>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
