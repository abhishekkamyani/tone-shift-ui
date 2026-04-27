// src/hooks/useAuthSync.ts
import { useAuth0 } from '@auth0/auth0-react';
import { useEffect, useState } from 'react';

export const useAuthSync = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();
  const [dbUser, setDbUser] = useState(null);

  useEffect(() => {
    const syncUser = async () => {
      if (isAuthenticated && user) {
        try {
          const token = await getAccessTokenSilently();
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              picture: user.picture,
            }),
          });

          const data = await response.json();
          setDbUser(data);
        } catch (error) {
          console.error("Failed to sync user with backend:", error);
        }
      }
    };

    syncUser();
  }, [isAuthenticated, user, getAccessTokenSilently]);

  return { dbUser };
};