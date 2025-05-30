
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AnimationContextType {
  speed: number;
  setSpeed: (speed: number) => void;
  getInterval: (baseInterval: number) => number;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimation = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimation must be used within an AnimationProvider');
  }
  return context;
};

interface AnimationProviderProps {
  children: ReactNode;
}

export const AnimationProvider = ({ children }: AnimationProviderProps) => {
  const [speed, setSpeed] = useState(1); // 1 = normal speed

  const getInterval = (baseInterval: number) => {
    return Math.max(50, baseInterval / speed); // Minimum 50ms interval
  };

  return (
    <AnimationContext.Provider value={{ speed, setSpeed, getInterval }}>
      {children}
    </AnimationContext.Provider>
  );
};
