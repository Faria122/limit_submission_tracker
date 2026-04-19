'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Typography from '@mui/material/Typography';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';

import { useBrokerOptions } from '@/lib/hooks/useBrokerOptions';
import { useDebounce } from '@/lib/hooks/useDebounce';
import type { Broker, SubmissionStatus } from '@/lib/types';

const STATUSES: { value: SubmissionStatus; label: string; color: string }[] = [
  { value: 'new',       label: 'New',       color: '#1565C0' },
  { value: 'in_review', label: 'In Review', color: '#E65100' },
  { value: 'closed',    label: 'Closed',    color: '#2E7D32' },
  { value: 'lost',      label: 'Lost',      color: '#6D4C41' },
];

export function FilterBar() {
  const router   = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [search,   setSearch]   = useState(searchParams.get('companySearch') ?? '');
  const [status,   setStatus]   = useState(searchParams.get('status') ?? '');
  const [broker,   setBroker]   = useState<Broker | null>(null);

  const debouncedSearch = useDebounce(search, 500);
  const { data: brokers = [] } = useBrokerOptions();

  useEffect(() => {
    const id = searchParams.get('brokerId');
    if (id && brokers.length > 0) {
      setBroker(brokers.find((b) => String(b.id) === id) ?? null);
    }
  }, [brokers]); 

  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('companySearch', debouncedSearch);
    if (status)          params.set('status', status);
    if (broker)          params.set('brokerId', String(broker.id));
    params.delete('page'); 
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, status, broker]); 
  const hasFilters = !!(search || status || broker);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}
    >
     
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <FilterListIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
        <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing="0.06em">
          FILTERS
        </Typography>
        {hasFilters && (
          <Button
            size="small"
            onClick={() => { setSearch(''); setStatus(''); setBroker(null); }}
            sx={{ ml: 'auto', fontSize: '0.72rem', color: 'text.secondary', textTransform: 'none' }}
          >
            Clear all
          </Button>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'flex-start' }}>
        
        <TextField
          size="small"
          placeholder="Search company…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 17, color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 200, flexGrow: 1, maxWidth: 300 }}
        />

        
        <Autocomplete
          size="small"
          options={brokers}
          value={broker}
          onChange={(_, val) => setBroker(val)}
          getOptionLabel={(b) => b.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => <TextField {...params} placeholder="All brokers" />}
          sx={{ minWidth: 190, flexGrow: 1, maxWidth: 260 }}
          noOptionsText="No brokers found"
        />

        <ToggleButtonGroup
          value={status}
          exclusive
          onChange={(_, val) => setStatus(val ?? '')}
          size="small"
          sx={{
            flexWrap: 'wrap',
            gap: 0.5,
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid !important',
              borderRadius: '20px !important',
              mx: 0,
            },
          }}
        >
          {STATUSES.map((s) => (
            <ToggleButton
              key={s.value}
              value={s.value}
              sx={{
                px: 1.5,
                py: 0.4,
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                textTransform: 'none',
                borderColor: `${s.color}44 !important`,
                color: status === s.value ? '#fff !important' : s.color,
                bgcolor: status === s.value ? `${s.color} !important` : `${s.color}12`,
                '&:hover': { bgcolor: `${s.color}22` },
              }}
            >
              {s.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
