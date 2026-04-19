'use client';

import { useParams, useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmailIcon from '@mui/icons-material/Email';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';

import { PriorityChip, StatusChip } from '@/components/ui/StatusChip';
import { useSubmissionDetail } from '@/lib/hooks/useSubmissions';
import { formatDistanceToNow } from '@/lib/utils/date';

export default function SubmissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: sub, isLoading, isError } = useSubmissionDetail(id ?? '');

  if (isError) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()} sx={{ mb: 2 }}>
          Back to list
        </Button>
        <Alert severity="error">Submission not found or failed to load.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 } }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        size="small"
        sx={{ mb: 2, color: 'text.secondary', textTransform: 'none' }}
      >
        Back to list
      </Button>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          {isLoading ? (
            <>
              <Skeleton variant="text" width={280} height={30} />
              <Skeleton variant="text" width={180} height={20} />
            </>
          ) : (
            <>
              <Typography variant="h6" fontWeight={700}>
                #{sub!.id} — {sub!.company.legalName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sub!.company.industry} · {sub!.company.headquartersCity}
              </Typography>
            </>
          )}
        </Box>
        {sub && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <StatusChip status={sub.status} />
            <PriorityChip priority={sub.priority} />
          </Box>
        )}
      </Box>

      <Grid container spacing={2}>
        {/* ── Left column ── */}
        <Grid item xs={12} md={5}>

          {/* SECTION 1: Summary */}
          <SectionCard title="ABOUT">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} variant="text" width="75%" sx={{ mb: 0.5 }} />
              ))
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <InfoRow label="Broker"  value={sub!.broker.name} />
                <InfoRow label="Contact" value={sub!.broker.primaryContactEmail ?? '—'} />
                <InfoRow label="Owner"   value={sub!.owner?.fullName ?? '—'} />
                <InfoRow label="Created" value={new Date(sub!.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} />
                {sub!.summary && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} display="block" mb={0.3} letterSpacing="0.05em">
                      SUMMARY
                    </Typography>
                    <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                      {sub!.summary}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </SectionCard>

          {/* SECTION 3: Contacts — uses Box/Typography only, NO ListItemText */}
          {/* Reason: ListItemText renders secondary inside a <p> tag by default. */}
          {/* Putting a <Box> (div) inside it causes an invalid HTML hydration error. */}
          <SectionCard title={`Contacts (${sub?.contacts?.length ?? 0})`} sx={{ mt: 2 }}>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                  <Skeleton variant="circular" width={34} height={34} />
                  <Box flex={1}>
                    <Skeleton variant="text" width={130} />
                    <Skeleton variant="text" width={100} />
                  </Box>
                </Box>
              ))
            ) : sub?.contacts?.length === 0 ? (
              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                No contacts listed
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {sub?.contacts?.map((c) => (
                  <Box key={c.id} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <Avatar sx={{ width: 32, height: 32, fontSize: '0.7rem', bgcolor: 'primary.light', flexShrink: 0 }}>
                      <PersonIcon sx={{ fontSize: 16 }} />
                    </Avatar>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                        <Typography variant="body2" fontWeight={600} component="div">
                          {c.name}
                        </Typography>
                        {c.role && (
                          <Typography variant="caption" color="text.secondary">
                            · {c.role}
                          </Typography>
                        )}
                      </Box>
                      {c.email && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                          <EmailIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">{c.email}</Typography>
                        </Box>
                      )}
                      {c.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.2 }}>
                          <PhoneIcon sx={{ fontSize: 12, color: 'text.disabled' }} />
                          <Typography variant="caption" color="text.secondary">{c.phone}</Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>
        </Grid>

        {/* ── Right column ── */}
        <Grid item xs={12} md={7}>

          {/* SECTION 2: Notes thread */}
          <SectionCard title={`Notes (${sub?.notes?.length ?? 0})`}>
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Box key={i} sx={{ mb: 2 }}>
                  <Skeleton variant="text" width={120} />
                  <Skeleton variant="rounded" width="100%" height={50} sx={{ mt: 0.5 }} />
                </Box>
              ))
            ) : sub?.notes?.length === 0 ? (
              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                No notes yet
              </Typography>
            ) : (
              <Box sx={{ maxHeight: 340, overflowY: 'auto', pr: 0.5 }}>
                {sub?.notes?.map((note, idx) => (
                  <Box key={note.id}>
                    <Box sx={{ display: 'flex', gap: 1.5, py: 1.5 }}>
                      <Avatar sx={{ width: 30, height: 30, fontSize: '0.65rem', flexShrink: 0, bgcolor: 'secondary.light' }}>
                        {note.authorName[0]?.toUpperCase()}
                      </Avatar>
                      <Box flex={1}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 0.4 }}>
                          <Typography variant="caption" fontWeight={700}>{note.authorName}</Typography>
                          <Typography variant="caption" color="text.disabled">
                            {formatDistanceToNow(note.createdAt)}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ lineHeight: 1.65 }}>
                          {note.body}
                        </Typography>
                      </Box>
                    </Box>
                    {idx < (sub.notes.length - 1) && <Divider />}
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>

          {/* SECTION 4: Documents */}
          <SectionCard title={`Documents (${sub?.documents?.length ?? 0})`} sx={{ mt: 2 }}>
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <Skeleton key={i} variant="rounded" width="100%" height={50} sx={{ mb: 1 }} />
              ))
            ) : sub?.documents?.length === 0 ? (
              <Typography variant="body2" color="text.disabled" fontStyle="italic">
                No documents attached
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sub?.documents?.map((doc) => (
                  <Box
                    key={doc.id}
                    sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5,
                      p: 1.5, borderRadius: 1.5,
                      border: '1px solid', borderColor: 'divider', bgcolor: 'grey.50',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <InsertDriveFileIcon sx={{ color: 'primary.main', fontSize: 22, flexShrink: 0 }} />
                    <Box flex={1} minWidth={0}>
                      <Typography variant="body2" fontWeight={600} noWrap>{doc.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{doc.docType}</Typography>
                    </Box>
                    {doc.fileUrl && (
                      <Button
                        size="small"
                        endIcon={<OpenInNewIcon sx={{ fontSize: '13px !important' }} />}
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ flexShrink: 0, fontSize: '0.72rem', textTransform: 'none' }}
                      >
                        Open
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </SectionCard>
        </Grid>
      </Grid>
    </Container>
  );
}

function SectionCard({ title, children, sx }: { title: string; children: React.ReactNode; sx?: object }) {
  return (
    <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden', ...sx }}>
      <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="caption" fontWeight={700} color="text.secondary" letterSpacing="0.07em" textTransform="uppercase">
          {title}
        </Typography>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'baseline' }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ minWidth: 58, flexShrink: 0 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
