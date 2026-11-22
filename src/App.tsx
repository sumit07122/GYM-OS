import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { TenantProvider } from '@/lib/tenant/context';
import { AppRouter } from '@/app/router';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <TenantProvider>
        <AppRouter />
      </TenantProvider>
    </BrowserRouter>
  );
};

export default App;
