'use client';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';

export function SubmissionRowSkeleton() {
  return (
    <TableRow>
      <TableCell><Skeleton variant="rounded" width={70} height={22} /></TableCell>
      <TableCell>
        <Skeleton variant="text" width={160} height={20} />
        <Skeleton variant="text" width={100} height={15} sx={{ mt: 0.3 }} />
      </TableCell>
      <TableCell><Skeleton variant="text" width={120} height={20} /></TableCell>
      <TableCell><Skeleton variant="text" width={200} height={20} /></TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={38} height={22} />
          <Skeleton variant="rounded" width={38} height={22} />
        </Box>
      </TableCell>
      <TableCell><Skeleton variant="circular" width={30} height={30} /></TableCell>
    </TableRow>
  );
}

export function SubmissionCardSkeleton() {
  return (
    <Box sx={{ p: 2, mb: 1.5, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Skeleton variant="text" width={150} height={22} />
        <Skeleton variant="rounded" width={70} height={22} />
      </Box>
      <Skeleton variant="text" width={110} height={18} />
      <Skeleton variant="text" width="90%" height={16} sx={{ mt: 1 }} />
      <Box sx={{ display: 'flex', gap: 1, mt: 1.5 }}>
        <Skeleton variant="rounded" width={50} height={20} />
        <Skeleton variant="rounded" width={50} height={20} />
      </Box>
    </Box>
  );
}
