import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { OnboardingProvider } from './context/OnboardingContext';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  return (
    <BrowserRouter>
      <OnboardingProvider>
        <AppRoutes />
      </OnboardingProvider>
    </BrowserRouter>
  );
}

export default App;
