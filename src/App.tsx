import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import { Auth0Provider } from '@auth0/auth0-react';

function App() {
  return (
    <ThemeProvider>
      <Auth0Provider
        domain="toneshiftai.us.auth0.com"
        clientId="dCVm2quBKESux3fcKLJruAxeng0G2lQV"
        authorizationParams={{
          redirect_uri: window.location.origin + '/dashboard',
          audience: "https://api.toneshift.com" // This MUST match your Auth0 API Identifier
        }}
      >
        <BrowserRouter basename={__BASE_PATH__}>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--color-surface)',
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                fontSize: '13px',
              },
            }}
          />
        </BrowserRouter>
      </Auth0Provider>
    </ThemeProvider>
  );
}

export default App;
