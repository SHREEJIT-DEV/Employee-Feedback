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
        backgroundImage: `
          radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.18) 0px, transparent 50%),
          radial-gradient(at 100% 0%, rgba(168, 85, 247, 0.15) 0px, transparent 50%),
          radial-gradient(at 100% 100%, rgba(16, 185, 129, 0.12) 0px, transparent 50%),
          radial-gradient(at 0% 100%, rgba(56, 189, 248, 0.14) 0px, transparent 50%)
        `,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* High-Contrast Visible Precision Background Grid Overlay */}
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(99, 102, 241, 0.18) 1.2px, transparent 1.2px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.18) 1.2px, transparent 1.2px)
          `,
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, #000 80%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 90% at 50% 50%, #000 80%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Ambient Glowing Mesh Orbs */}
      <Box
        sx={{
          position: 'fixed',
          top: '-10%',
          left: '20%',
          width: '550px',
          height: '550px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, rgba(99, 102, 241, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '-15%',
          right: '15%',
          width: '650px',
          height: '650px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.16) 0%, rgba(16, 185, 129, 0) 70%)',
          filter: 'blur(110px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '35%',
          right: '-5%',
          width: '450px',
          height: '450px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.18) 0%, rgba(168, 85, 247, 0) 70%)',
          filter: 'blur(90px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

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
