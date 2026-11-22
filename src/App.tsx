import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme/context';
import { AuthProvider } from '@/lib/auth/context';
import { TenantProvider } from '@/lib/tenant/context';
import { AppRouter } from '@/app/router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <TenantProvider>
            <AppRouter />
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
