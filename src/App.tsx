import { BrowserRouter } from 'react-router-dom';
import { AppRoutes } from './router';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'sonner';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { MailCheck, LogIn, AlertCircle } from 'lucide-react';

// 1. Create a Wrapper to intercept Auth0 states
function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { error, logout, isLoading } = useAuth0();

  // Show a simple loading state while Auth0 initializes
  if (isLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-text-primary font-medium">Loading...</div>;
  }

  // Intercept Auth0 Errors
  if (error) {
    // Check if it's our specific "Verify Email" action error
    const isVerificationError = error.message.toLowerCase().includes('verify');

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-background-surface border border-border rounded-2xl p-8 flex flex-col items-center gap-5 shadow-lg">
          
          <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-2 ${isVerificationError ? 'bg-primary-500/10' : 'bg-red-500/10'}`}>
            {isVerificationError ? (
              <MailCheck className="text-primary-500" size={28} />
            ) : (
              <AlertCircle className="text-red-500" size={28} />
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-text-primary">
            {isVerificationError ? 'Verify Your Email' : 'Authentication Error'}
          </h1>
          
          {isVerificationError ? (
            // Step-by-step instructions for the user
            <div className="w-full bg-background p-5 rounded-xl border border-border text-left">
              <p className="text-text-primary font-medium mb-3">Almost there! Please follow these steps:</p>
              <ol className="list-decimal list-inside space-y-2 text-text-secondary text-sm">
                <li>Check your inbox for an email from us.</li>
                <li>Click the verification link inside that email.</li>
                <li>Close the new tab that opens.</li>
                <li>Come back here and click the button below.</li>
              </ol>
            </div>
          ) : (
            // Generic fallback error
            <p className="text-text-secondary leading-relaxed">
              {error.message}
            </p>
          )}
          
          <button
            // We still call logout to clear the blocked session so they can log in fresh!
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="mt-2 w-full flex justify-center items-center gap-2 px-6 py-3 rounded-xl bg-primary-600 text-white font-medium hover:bg-primary-700 transition-colors shadow-sm"
          >
            {isVerificationError ? (
              <>
                I've verified my email <LogIn size={18} />
              </>
            ) : (
              'Return to Login'
            )}
          </button>
        </div>
      </div>
    );
  }

  // If no errors, render the actual app
  return <>{children}</>;
}

// 2. Main App Component
function App() {
  return (
    <ThemeProvider>
      <Auth0Provider
        domain={import.meta.env.VITE_AUTH0_DOMAIN}
        clientId={import.meta.env.VITE_AUTH0_CLIENT_ID}
        authorizationParams={{
          redirect_uri: window.location.origin + '/dashboard',
          audience: import.meta.env.VITE_AUTH0_AUDIENCE 
        }}
      >
        <AuthWrapper>
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
        </AuthWrapper>
      </Auth0Provider>
    </ThemeProvider>
  );
}

export default App;