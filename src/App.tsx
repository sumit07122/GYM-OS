import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/lib/theme/context';
import { TenantProvider } from '@/lib/tenant/context';
import { AppRouter } from '@/app/router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <TenantProvider>
          <AppRouter />
        </TenantProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
