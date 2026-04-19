
'use client';
{/**'use client';
import {
  Box,
  Card,
  CardContent,
  Container,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import { Broker, SubmissionStatus } from '@/lib/types';

const STATUS_OPTIONS: { label: string; value: SubmissionStatus | '' }[] = [
  { label: 'All statuses', value: '' },
  { label: 'New', value: 'new' },
  { label: 'In Review', value: 'in_review' },
  { label: 'Closed', value: 'closed' },
  { label: 'Lost', value: 'lost' },
];
export default function SubmissionsPage() {
  const [status, setStatus] = useState<SubmissionStatus | ''>('');
  const [brokerId, setBrokerId] = useState('');
  const [companyQuery, setCompanyQuery] = useState('');

  const filters = useMemo(
    () => ({
      status: status || undefined,
      brokerId: brokerId || undefined,
      companySearch: companyQuery || undefined,
    }),
    [status, brokerId, companyQuery],
  );

  const submissionsQuery = useSubmissionsList(filters);
  const brokerQuery = useBrokerOptions();

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Stack spacing={4}>
        <Box>
          <Typography variant="h4" component="h1">
            Submissions
          </Typography>
          <Typography color="text.secondary">
            Filters update the query parameters and drive backend filtering. Hook these inputs to
            your API calls when you implement the actual data fetching.
          </Typography>
        </Box>

        <Card variant="outlined">
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={(event) => setStatus(event.target.value as SubmissionStatus | '')}
                fullWidth
              >
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Broker"
                value={brokerId}
                onChange={(event) => setBrokerId(event.target.value)}
                fullWidth
                helperText="Populate options via /api/brokers"
              >
               {} <MenuItem value="">All brokers</MenuItem>
                
                 {(brokerQuery.data ??[]).map((broker: Broker) => (
                    <MenuItem key={broker.id} value={String(broker.id)}>
                      {broker.name}
                    </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Company search"
                value={companyQuery}
                onChange={(event) => setCompanyQuery(event.target.value)}
                fullWidth
                helperText="Send as ?companySearch=..."
              />
            </Stack>
          </CardContent>
        </Card>
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6">Submission list</Typography>
              <Typography color="text.secondary">
                Hook `submissionsQuery` to render rows, totals, and pagination states. The query is
                disabled by default so no network calls fire until you enable it.
              </Typography>
              <Divider />
              <Box>
                <pre style={{ margin: 0, fontSize: 14 }}>
                  {JSON.stringify({ filters }, null, 2)}
                </pre>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
**/}

import { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import InboxIcon from '@mui/icons-material/Inbox';
import { FilterBar } from '@/components/submissions/FilterBar';
import { SubmissionCard } from '@/components/submissions/SubmissionCard';
import { SubmissionRow } from '@/components/submissions/SubmissionRow';
import { SubmissionCardSkeleton, SubmissionRowSkeleton } from '@/components/ui/SubmissionSkeleton';
import { useSubmissionsList } from '@/lib/hooks/useSubmissions';
import type { SubmissionListFilters, SubmissionStatus } from '@/lib/types';

const PAGE_SIZE = 10;

const TABLE_HEADERS = ['Status', 'Company', 'Broker', 'Latest Note', 'Docs / Notes', 'Owner'];

function SubmissionsPageInner() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const pathname     = usePathname();
  const theme        = useTheme();
  const isMobile     = useMediaQuery(theme.breakpoints.down('sm'));

  const currentPage = parseInt(searchParams.get('page') ?? '1', 10);

  // Build filter object directly from URL — the URL is the single source of truth
  const filters: SubmissionListFilters = useMemo(
    () => ({
      companySearch: searchParams.get('companySearch') || undefined,
      status: (searchParams.get('status') as SubmissionStatus) || undefined,
      brokerId: searchParams.get('brokerId') || undefined,
      page: currentPage,
      pageSize: PAGE_SIZE,
    }),
    [searchParams, currentPage],
  );

  const { data, isLoading, isError, refetch } = useSubmissionsList(filters);

  const totalPages = data ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const handlePageChange = (_: unknown, page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    page === 1 ? params.delete('page') : params.set('page', String(page));
    router.push(`${pathname}?${params.toString()}`, { scroll: true });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      {/* Page header */}
      <Box sx={{ mb: 3 }}>
       {/* <Typography variant="h5" fontWeight={700} gutterBottom>
          Submissions
        </Typography>  */}
        <Typography variant="body2" color="text.secondary">
          {isLoading
            ? 'Loading…'
            : `${data?.count ?? 0} submission${data?.count !== 1 ? 's' : ''} found`}
        </Typography>
      </Box>

      {/* Filter bar — all filters sync to URL */}
      <FilterBar />

      {/* Error state with retry */}
      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={<Button size="small" onClick={() => refetch()}>Retry</Button>}
        >
          Failed to load submissions. Make sure the backend is running on port 8000.
        </Alert>
      )}

      {/* ── MOBILE: card stack ── */}
      {isMobile && (
        <Box>
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => <SubmissionCardSkeleton key={i} />)
            : data?.results.length === 0
            ? <EmptyState />
            : data?.results.map((s) => <SubmissionCard key={s.id} submission={s} />)}
        </Box>
      )}

      {/* ── DESKTOP: table ── */}
      {!isMobile && (
        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                {TABLE_HEADERS.map((h) => (
                  <TableCell
                    key={h}
                    sx={{
                      fontWeight: 700, fontSize: '0.7rem',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                      color: 'text.secondary', py: 1.25,
                    }}
                  >
                    {h}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading
                ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SubmissionRowSkeleton key={i} />)
                : data?.results.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={6}><EmptyState /></TableCell>
                  </TableRow>
                )
                : data?.results.map((s) => <SubmissionRow key={s.id} submission={s} />)}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size={isMobile ? 'small' : 'medium'}
            showFirstButton
            showLastButton
          />
        </Box>
      )}
    </Container>
  );
}

function EmptyState() {
  return (
    <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'text.disabled' }}>
      <InboxIcon sx={{ fontSize: 48 }} />
      <Typography variant="body1" fontWeight={600}>No submissions found</Typography>
      <Typography variant="body2">Try adjusting your filters or clearing the search.</Typography>
    </Box>
  );
}

// Suspense boundary required by Next.js app router for useSearchParams
export default function SubmissionsPage() {
  return (
    <Suspense>
      <SubmissionsPageInner />
    </Suspense>
  );
}
