import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface AvatarContextType {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  clearAvatar: () => void;
}

const AvatarContext = createContext<AvatarContextType>({
  avatarUrl: null,
  setAvatarUrl: () => {},
  clearAvatar: () => {},
});

export function useAvatar() {
  return useContext(AvatarContext);
}

export function AvatarProvider({ children }: { children: React.ReactNode }) {
  const [avatarUrl, setAvatarUrlState] = useState<string | null>(() => {
    // Initialize from localStorage on first render
    return localStorage.getItem('ndi_patient_avatar');
  });

  const setAvatarUrl = useCallback((url: string | null) => {
    if (url) {
      localStorage.setItem('ndi_patient_avatar', url);
    } else {
      localStorage.removeItem('ndi_patient_avatar');
    }
    setAvatarUrlState(url);
  }, []);

  const clearAvatar = useCallback(() => {
    localStorage.removeItem('ndi_patient_avatar');
    setAvatarUrlState(null);
  }, []);

  return (
    <AvatarContext.Provider value={{ avatarUrl, setAvatarUrl, clearAvatar }}>
      {children}
    </AvatarContext.Provider>
  );
}
