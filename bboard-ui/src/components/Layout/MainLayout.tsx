import React from 'react';
import { Box, Typography } from '@mui/material';
import { Header } from './Header';

export const MainLayout: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#06080d',
        backgroundImage: 'url(/bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
        position: 'relative',
        overflow: 'hidden',
      }}
    >

      <Header />

      <Box component="main" sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
        {children}
      </Box>

      <Box
        component="footer"
        sx={{
          py: 3,
          px: 4,
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          textAlign: 'center',
          backgroundColor: 'rgba(10, 14, 24, 0.75)',
          backdropFilter: 'blur(20px) saturate(180%)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600, letterSpacing: '0.02em' }}>
          Midnight Network • Zero-Knowledge Confidential Survey dApp • Built on Compact Smart Contracts
        </Typography>
      </Box>
    </Box>
  );
};
