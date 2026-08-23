import React, { useState, useEffect } from 'react';
import { AppBar, Box, Button, Typography, Chip, Tooltip } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export const Header: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).midnight?.mnLace) {
      setWalletConnected(true);
      setWalletAddress('mn_addr_preprod1_active');
    }
  }, []);

  const handleConnect = async () => {
    if (typeof window !== 'undefined' && (window as any).midnight?.mnLace) {
      try {
        const lace = (window as any).midnight.mnLace;
        await lace.enable();
        setWalletConnected(true);
        setWalletAddress('mn_addr_preprod1_connected');
      } catch (e) {
        setWalletConnected(true);
        setWalletAddress('mn_addr_preprod1_simulated');
      }
    } else {
      setWalletConnected(true);
      setWalletAddress('mn_addr_preprod1_simulated');
    }
  };

  const handleDisconnect = () => {
    setWalletConnected(false);
    setWalletAddress('');
  };

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: 'rgba(12, 16, 26, 0.55)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        px: { xs: 2, sm: 4, md: 6 },
        py: 1.6,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      {/* Brand & Glass Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: '14px',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderTop: '1px solid rgba(255, 255, 255, 0.35)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
            boxShadow: '0 4px 16px rgba(99, 102, 241, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(99, 102, 241, 0.25)',
              transform: 'scale(1.05)',
              boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
            },
          }}
        >
          <LockOutlinedIcon sx={{ fontSize: 22 }} />
        </Box>
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: '1.1rem',
                color: '#f8fafc',
                letterSpacing: '-0.02em',
                background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Midnight ZK Feedback
            </Typography>
            <Chip
              label="Dark Theme"
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: '#34d399',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                backdropFilter: 'blur(8px)',
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: '#64748b',
              fontSize: '0.75rem',
              display: 'block',
            }}
          >
            Zero-Knowledge Confidential Survey Platform
          </Typography>
        </Box>
      </Box>

      {/* Network & Glass Wallet Controls */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Chip
          label={`Network: ${import.meta.env.VITE_NETWORK || 'Preprod'}`}
          size="small"
          sx={{
            height: 30,
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            backdropFilter: 'blur(10px)',
            color: '#94a3b8',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        />

        {walletConnected ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={copied ? 'Address Copied!' : 'Click to Copy Address'}>
              <Chip
                icon={<CheckCircleOutlineIcon sx={{ color: '#34d399 !important', fontSize: 16 }} />}
                label={`${walletAddress.substring(0, 16)}...`}
                onClick={copyAddress}
                onDelete={copyAddress}
                deleteIcon={<ContentCopyIcon sx={{ color: '#94a3b8 !important', fontSize: 14 }} />}
                sx={{
                  height: 38,
                  px: 0.5,
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  backdropFilter: 'blur(12px)',
                  color: '#34d399',
                  border: '1px solid rgba(16, 185, 129, 0.25)',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(16, 185, 129, 0.16)',
                  },
                }}
              />
            </Tooltip>

            <Button
              variant="text"
              size="small"
              onClick={handleDisconnect}
              sx={{
                color: '#64748b',
                fontSize: '0.78rem',
                minWidth: 'auto',
                px: 1.5,
                '&:hover': {
                  color: '#f87171',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                },
              }}
            >
              Disconnect
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            size="small"
            onClick={handleConnect}
            startIcon={<AccountBalanceWalletIcon sx={{ fontSize: 18 }} />}
            sx={{
              height: 40,
              fontSize: '0.85rem',
              fontWeight: 600,
              px: 2.5,
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.9) 0%, rgba(79, 70, 229, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '12px',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 1) 0%, rgba(67, 56, 202, 1) 100%)',
                boxShadow: '0 8px 25px rgba(99, 102, 241, 0.45)',
              },
            }}
          >
            Connect Lace
          </Button>
        )}
      </Box>
    </AppBar>
  );
};
