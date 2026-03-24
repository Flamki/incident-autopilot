import React, { createContext, useContext, useState, useEffect } from 'react';

export type FeatureFlag = 
  | 'ENABLE_EXPERIMENTAL_ANALYTICS' 
  | 'ENABLE_ADVANCED_SEARCH' 
  | 'ENABLE_BETA_RECOVERY_PLANS'
  | 'SHOW_DEVELOPER_TOOLS';

interface FeatureFlagContextType {
  flags: Record<FeatureFlag, boolean>;
  toggleFlag: (flag: FeatureFlag) => void;
  isFeatureEnabled: (flag: FeatureFlag) => boolean;
}

const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  ENABLE_EXPERIMENTAL_ANALYTICS: false,
  ENABLE_ADVANCED_SEARCH: true,
  ENABLE_BETA_RECOVERY_PLANS: false,
  SHOW_DEVELOPER_TOOLS: false,
};

const FeatureFlagContext = createContext<FeatureFlagContextType | undefined>(undefined);

export function FeatureFlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<FeatureFlag, boolean>>(() => {
    const saved = localStorage.getItem('autopilot_feature_flags');
    return saved ? JSON.parse(saved) : DEFAULT_FLAGS;
  });

  useEffect(() => {
    localStorage.setItem('autopilot_feature_flags', JSON.stringify(flags));
  }, [flags]);

  const toggleFlag = (flag: FeatureFlag) => {
    setFlags(prev => ({
      ...prev,
      [flag]: !prev[flag]
    }));
  };

  const isFeatureEnabled = (flag: FeatureFlag) => {
    return !!flags[flag];
  };

  return (
    <FeatureFlagContext.Provider value={{ flags, toggleFlag, isFeatureEnabled }}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error('useFeatureFlags must be used within a FeatureFlagProvider');
  }
  return context;
}
