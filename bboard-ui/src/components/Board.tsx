import React, { useCallback, useEffect, useState } from 'react';
import { type ContractAddress } from '@midnight-ntwrk/midnight-js-protocol/compact-runtime';
import {
  Backdrop,
  CircularProgress,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Rating,
  Chip,
  Alert,
  Snackbar,
  Paper,
  Divider,
  Grid,
  Tooltip,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LoginIcon from '@mui/icons-material/Login';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { type BBoardDerivedState, type DeployedBBoardAPI } from '../../../api/src/index';
import { useDeployedBoardContext } from '../hooks';
import { type BoardDeployment } from '../contexts';
import { type Observable } from 'rxjs';

export interface BoardProps {
  boardDeployment$?: Observable<BoardDeployment>;
}

const DEPARTMENTS = [
  'Engineering',
  'Product & Design',
  'Human Resources',
  'Sales & Marketing',
  'Operations & Finance',
  'Executive Management',
];

const RATING_LABELS: { [key: number]: string } = {
  1: 'Unsatisfactory',
  2: 'Needs Improvement',
  3: 'Satisfactory',
  4: 'Great Workplace',
  5: 'Exceptional Experience',
};

export const Board: React.FC<Readonly<BoardProps>> = ({ boardDeployment$ }) => {
  const boardApiProvider = useDeployedBoardContext();
  const [deployedBoardAPI, setDeployedBoardAPI] = useState<DeployedBBoardAPI>();
  const [errorMessage, setErrorMessage] = useState<string>();
  const [successMessage, setSuccessMessage] = useState<string>();
  const [boardState, setBoardState] = useState<BBoardDerivedState>();
  const [isWorking, setIsWorking] = useState(!!boardDeployment$);

  const [rating, setRating] = useState<number | null>(5);
  const [category, setCategory] = useState<string>('Engineering');
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [joinAddressInput, setJoinAddressInput] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);

  const onCreateBoard = useCallback(() => {
    setIsWorking(true);
    boardApiProvider.resolve();
  }, [boardApiProvider]);

  const onJoinBoard = useCallback(
    (contractAddress: ContractAddress) => {
      if (!contractAddress.trim()) return;
      setIsWorking(true);
      boardApiProvider.resolve(contractAddress.trim());
    },
    [boardApiProvider],
  );

  useEffect(() => {
    if (!boardDeployment$) return;

    const subscription = boardDeployment$.subscribe({
      next: (deployment) => {
        if (deployment.status === 'deployed') {
          setDeployedBoardAPI(deployment.api);
          setIsWorking(false);
        } else if (deployment.status === 'failed') {
          const msg = deployment.error?.message ?? 'Deployment failed';
          // Suppress wallet auth errors — expected when Lace is not connected/installed
          const isAuthError =
            msg.toLowerCase().includes('authorized') ||
            msg.toLowerCase().includes('failed to respond') ||
            msg.toLowerCase().includes('extension enabled') ||
            msg.toLowerCase().includes('could not find midnight lace wallet');
          if (!isAuthError) {
            setErrorMessage(msg);
          }
          setIsWorking(false);
        }
      },
    });

    return () => subscription.unsubscribe();
  }, [boardDeployment$]);

  useEffect(() => {
    if (!deployedBoardAPI) return;

    const subscription = deployedBoardAPI.state$.subscribe({
      next: (state) => {
        setBoardState(state);
      },
    });

    return () => subscription.unsubscribe();
  }, [deployedBoardAPI]);

  const onSubmitFeedback = useCallback(async () => {
    if (!deployedBoardAPI || !rating) return;
    try {
      setIsWorking(true);
      await deployedBoardAPI.submitFeedback(rating, category, feedbackComment);
      setSuccessMessage('Anonymous ZK feedback proven & recorded on Midnight ledger');
      setFeedbackComment('');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const isAuthError =
        msg.toLowerCase().includes('authorized') ||
        msg.toLowerCase().includes('failed to respond') ||
        msg.toLowerCase().includes('extension enabled') ||
        msg.toLowerCase().includes('could not find midnight lace wallet');
      if (!isAuthError) {
        setErrorMessage(msg);
      }
    } finally {
      setIsWorking(false);
    }
  }, [deployedBoardAPI, rating, category, feedbackComment]);

  const onCopyAddress = useCallback(() => {
    if (deployedBoardAPI) {
      navigator.clipboard.writeText(deployedBoardAPI.deployedContractAddress);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  }, [deployedBoardAPI]);

  // Loading Glass Backdrop
  const backdrop = (
    <Backdrop
      sx={{
        color: '#818cf8',
        zIndex: (t) => t.zIndex.drawer + 1,
        backdropFilter: 'blur(20px) saturate(180%)',
        backgroundColor: 'rgba(6, 8, 13, 0.85)',
        flexDirection: 'column',
        gap: 2,
      }}
      open={isWorking}
    >
      <CircularProgress color="inherit" size={52} thickness={4} />
      <Typography variant="h6" sx={{ fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
        Computing Zero-Knowledge Proof Client-Side...
      </Typography>
      <Typography variant="body2" sx={{ color: '#94a3b8' }}>
        Witness privacy keys remain strictly local inside your browser
      </Typography>
    </Backdrop>
  );

  // Initial State: Deploy / Join Dark Glass Dialog Cards
  if (!boardDeployment$) {
    return (
      <Box sx={{ maxWidth: 940, mx: 'auto', mt: { xs: 4, md: 8 }, px: 2, pb: 8 }}>
        {backdrop}

        {/* Hero Headline */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            icon={<AutoAwesomeIcon sx={{ fontSize: '14px !important', color: '#818cf8 !important' }} />}
            label="Midnight Compact Circuits • Dark Glass Theme"
            size="small"
            sx={{
              backgroundColor: 'rgba(99, 102, 241, 0.12)',
              backdropFilter: 'blur(12px)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              mb: 2.5,
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
          />
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              fontSize: { xs: '2.2rem', md: '3rem' },
              color: '#f8fafc',
              letterSpacing: '-0.035em',
              mb: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Anonymous Employee Feedback
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              maxWidth: 640,
              mx: 'auto',
              color: '#94a3b8',
              fontSize: '1.05rem',
              lineHeight: 1.6,
            }}
          >
            Submit confidential workplace ratings & feedback backed by Zero-Knowledge proofs. Your identity and raw text are never exposed on-chain.
          </Typography>
        </Box>

        {/* Choice Cards */}
        <Grid container spacing={3}>
          {/* Card 1: Deploy New */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '24px',
                backgroundColor: 'rgba(13, 18, 30, 0.65)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: 'rgba(99, 102, 241, 0.45)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 25px 60px rgba(99, 102, 241, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(99, 102, 241, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8',
                    mb: 3,
                    boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
                  }}
                >
                  <AddCircleOutlineIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#f8fafc' }}>
                  Deploy Fresh Survey
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 4, lineHeight: 1.6 }}>
                  Initialize a fresh confidential survey contract on Midnight Preprod testnet to start collecting employee satisfaction metrics.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                onClick={onCreateBoard}
                fullWidth
                startIcon={<AddCircleOutlineIcon />}
                sx={{
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.95) 100%)',
                }}
              >
                Deploy Survey Contract
              </Button>
            </Paper>
          </Grid>

          {/* Card 2: Join Existing */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                height: '100%',
                borderRadius: '24px',
                backgroundColor: 'rgba(13, 18, 30, 0.65)',
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                '&:hover': {
                  borderColor: 'rgba(16, 185, 129, 0.45)',
                  transform: 'translateY(-4px)',
                  boxShadow: '0 25px 60px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
                },
              }}
            >
              <Box>
                <Box
                  sx={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderTop: '1px solid rgba(255, 255, 255, 0.35)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#34d399',
                    mb: 3,
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
                  }}
                >
                  <LoginIcon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, color: '#f8fafc' }}>
                  Connect to Existing Contract
                </Typography>
                <Typography variant="body2" sx={{ color: '#94a3b8', mb: 3, lineHeight: 1.6 }}>
                  Paste a 64-character hex contract address below to connect to an active company survey on-chain.
                </Typography>

                <TextField
                  fullWidth
                  placeholder="0200dbf964f541e19508..."
                  value={joinAddressInput}
                  onChange={(e) => setJoinAddressInput(e.target.value)}
                  sx={{ mb: 3 }}
                  inputProps={{
                    style: { fontFamily: "'JetBrains Mono', monospace", fontSize: '0.85rem' },
                  }}
                />
              </Box>

              <Button
                variant="outlined"
                size="large"
                onClick={() => onJoinBoard(joinAddressInput)}
                disabled={!joinAddressInput.trim()}
                fullWidth
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.6,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: '#34d399',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  },
                }}
              >
                Join Active Contract
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Calculate Metrics from Board State
  const totalCount = boardState?.totalFeedbackCount ? Number(boardState.totalFeedbackCount) : 0;
  const totalSum = boardState?.totalRatingSum ? Number(boardState.totalRatingSum) : 0;
  const averageRating = totalCount > 0 ? (totalSum / totalCount).toFixed(1) : '0.0';
  const latestCategory = boardState?.lastCategory ?? 'None Disclosed';
  const latestDigestHex = boardState?.lastFeedbackDigest
    ? typeof boardState.lastFeedbackDigest === 'string'
      ? boardState.lastFeedbackDigest
      : `0x${Array.from(boardState.lastFeedbackDigest as Uint8Array).map((b) => b.toString(16).padStart(2, '0')).join('')}`
    : '0x0000...';

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 4, md: 6 }, py: 4 }}>
      {backdrop}

      {/* Snackbar Notifications */}
      <Snackbar
        open={!!errorMessage && !errorMessage.toLowerCase().includes('authorized')}
        autoHideDuration={6000}
        onClose={() => setErrorMessage(undefined)}
      >
        <Alert severity="error" variant="filled" onClose={() => setErrorMessage(undefined)} sx={{ borderRadius: 3 }}>
          {errorMessage}
        </Alert>
      </Snackbar>

      <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={() => setSuccessMessage(undefined)}>
        <Alert severity="success" variant="filled" onClose={() => setSuccessMessage(undefined)} sx={{ borderRadius: 3 }}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Dark Glass Active Contract Bar */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 4,
          borderRadius: '24px',
          backgroundColor: 'rgba(13, 18, 30, 0.65)',
          backdropFilter: 'blur(24px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderTop: '1px solid rgba(255, 255, 255, 0.2)',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 16px #10b981',
            }}
          />
          <Box>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active On-Chain Contract Address
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: "'JetBrains Mono', monospace", color: '#f8fafc', fontWeight: 600 }}>
              {deployedBoardAPI?.deployedContractAddress}
            </Typography>
          </Box>
        </Box>

        <Tooltip title={copiedAddress ? 'Copied!' : 'Copy Contract Address'}>
          <Button
            variant="outlined"
            size="small"
            onClick={onCopyAddress}
            startIcon={copiedAddress ? <CheckCircleOutlineIcon sx={{ color: '#10b981' }} /> : <ContentCopyIcon />}
            sx={{
              borderColor: 'rgba(255, 255, 255, 0.15)',
              color: copiedAddress ? '#10b981' : '#94a3b8',
              fontSize: '0.8rem',
              height: 38,
              backdropFilter: 'blur(10px)',
              '&:hover': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
                color: '#f8fafc',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
              },
            }}
          >
            {copiedAddress ? 'Copied' : 'Copy Address'}
          </Button>
        </Tooltip>
      </Paper>

      {/* Dark Glass Aggregate Metrics Bar */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {/* Metric 1: Total Submissions */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              backgroundColor: 'rgba(13, 18, 30, 0.65)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                boxShadow: '0 12px 30px rgba(99, 102, 241, 0.15)',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Feedbacks
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#f8fafc', mt: 0.5 }}>
              {totalCount}
            </Typography>
            <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
              Verifiable ZK Receipts
            </Typography>
          </Paper>
        </Grid>

        {/* Metric 2: Average Score */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              backgroundColor: 'rgba(13, 18, 30, 0.65)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: 'rgba(251, 191, 36, 0.4)',
                boxShadow: '0 12px 30px rgba(251, 191, 36, 0.15)',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Average Satisfaction
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mt: 0.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: '#fbbf24' }}>
                {averageRating}
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                / 5.0
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
              <Rating value={Number(averageRating)} precision={0.1} readOnly size="small" icon={<StarRoundedIcon sx={{ color: '#fbbf24', fontSize: 16 }} />} emptyIcon={<StarRoundedIcon sx={{ opacity: 0.25, fontSize: 16 }} />} />
            </Box>
          </Paper>
        </Grid>

        {/* Metric 3: Latest Department */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              backgroundColor: 'rgba(13, 18, 30, 0.65)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: 'rgba(168, 85, 247, 0.4)',
                boxShadow: '0 12px 30px rgba(168, 85, 247, 0.15)',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest Category
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={latestCategory}
                size="small"
                sx={{
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  backdropFilter: 'blur(10px)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
              Public Disclosed Tag
            </Typography>
          </Paper>
        </Grid>

        {/* Metric 4: Latest ZK Content Hash */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '20px',
              backgroundColor: 'rgba(13, 18, 30, 0.65)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-3px)',
                borderColor: 'rgba(16, 185, 129, 0.4)',
                boxShadow: '0 12px 30px rgba(16, 185, 129, 0.15)',
              },
            }}
          >
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Latest Content Hash Digest
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontFamily: "'JetBrains Mono', monospace",
                color: '#34d399',
                fontWeight: 600,
                mt: 1,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {latestDigestHex}
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 0.5 }}>
              32-Byte SHA-256 Digest
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Grid: Left = Submit Form, Right = ZK Privacy Model */}
      <Grid container spacing={4}>
        {/* Left Column: Glass Form */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 4.5 },
              borderRadius: '28px',
              backgroundColor: 'rgba(13, 18, 30, 0.65)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2)',
                }}
              >
                <LockOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                Submit Confidential Feedback
              </Typography>
            </Box>

            {/* Rating Selector */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1.5, fontWeight: 600 }}>
                1. Select Overall Rating (1–5 Stars)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating
                  value={rating}
                  onChange={(_, newValue) => setRating(newValue)}
                  size="large"
                  icon={<StarRoundedIcon sx={{ color: '#fbbf24', fontSize: 34 }} />}
                  emptyIcon={<StarRoundedIcon sx={{ color: 'rgba(255, 255, 255, 0.15)', fontSize: 34 }} />}
                />
                {rating && (
                  <Chip
                    label={RATING_LABELS[rating]}
                    size="small"
                    sx={{
                      backgroundColor: 'rgba(251, 191, 36, 0.15)',
                      backdropFilter: 'blur(10px)',
                      color: '#fbbf24',
                      border: '1px solid rgba(251, 191, 36, 0.3)',
                      fontWeight: 700,
                    }}
                  />
                )}
              </Box>
            </Box>

            {/* Department Dropdown */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1.5, fontWeight: 600 }}>
                2. Department / Category Tag
              </Typography>
              <TextField
                select
                fullWidth
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                sx={{
                  '& .MuiSelect-select': {
                    color: '#f8fafc',
                    fontWeight: 600,
                  },
                }}
              >
                {DEPARTMENTS.map((dept) => (
                  <MenuItem key={dept} value={dept} sx={{ fontWeight: 500 }}>
                    {dept}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Feedback Message */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ color: '#94a3b8', mb: 1.5, fontWeight: 600 }}>
                3. Confidential Feedback Message
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Share your confidential thoughts, suggestions, or concerns regarding company culture or management..."
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                sx={{
                  '& .MuiInputBase-input': {
                    lineHeight: 1.6,
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: '#64748b', display: 'block', mt: 1 }}>
                * Message remains strictly local client-side; only a SHA-256 cryptographic digest is stored on the ledger.
              </Typography>
            </Box>

            {/* Action Button */}
            <Button
              variant="contained"
              size="large"
              onClick={onSubmitFeedback}
              disabled={!rating || isWorking}
              fullWidth
              startIcon={<SendRoundedIcon />}
              sx={{
                py: 2,
                fontWeight: 800,
                fontSize: '1.05rem',
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.95) 0%, rgba(79, 70, 229, 1) 100%)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(67, 56, 202, 1) 100%)',
                  boxShadow: '0 12px 35px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.45)',
                },
              }}
            >
              Prove & Submit Anonymous Feedback
            </Button>
          </Paper>
        </Grid>

        {/* Right Column: Zero-Knowledge Privacy Model */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3.5, sm: 4 },
              borderRadius: '28px',
              backgroundColor: 'rgba(13, 18, 30, 0.65)',
              backdropFilter: 'blur(24px) saturate(180%)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderTop: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderTop: '1px solid rgba(255, 255, 255, 0.35)',
                  backdropFilter: 'blur(10px)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#34d399',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.2)',
                }}
              >
                <ShieldOutlinedIcon sx={{ fontSize: 22 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                Zero-Knowledge Privacy Model
              </Typography>
            </Box>

            {/* Disclosed State Section */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ color: '#34d399', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CheckCircleOutlineIcon sx={{ fontSize: 18 }} /> What Observers CAN Learn (On-Chain)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7, pl: 3.2 }}>
                • Total feedback count & running rating sum (for public average satisfaction calculation).<br />
                • Disclosed department category tag.<br />
                • 32-byte SHA-256 cryptographic digest of feedback message.
              </Typography>
            </Box>

            <Divider sx={{ my: 3, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Secret Witness Section */}
            <Box>
              <Typography variant="subtitle2" sx={{ color: '#818cf8', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LockOutlinedIcon sx={{ fontSize: 18 }} /> What Observers CANNOT Learn (Private Witness)
              </Typography>
              <Typography variant="body2" sx={{ color: '#94a3b8', lineHeight: 1.7, pl: 3.2 }}>
                • Employee wallet address (`mn_addr_...`) or identity keys.<br />
                • Individual rating score tied to specific submitting employee.<br />
                • Raw confidential feedback text content.
              </Typography>
            </Box>
          </Paper>

          {/* On-Chain Verification Glass Badge */}
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '24px',
              backgroundColor: 'rgba(16, 185, 129, 0.06)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderTop: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 12px 30px rgba(16, 185, 129, 0.1)',
            }}
          >
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.18)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#34d399',
                flexShrink: 0,
              }}
            >
              <VerifiedUserOutlinedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#f8fafc' }}>
                Verifiable Compact Circuit
              </Typography>
              <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                Circuit bounds enforced via `compact compile` witness rules
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
