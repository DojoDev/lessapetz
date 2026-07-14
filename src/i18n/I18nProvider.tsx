'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { Dictionary, Locale } from './index';

interface I18nContextProps {
  dict: Dictionary;
  locale: Locale;
}

const I18nContext = createContext<I18nContextProps | undefined>(undefined);

export function I18nProvider({ 
  children, 
  dict, 
  locale 
}: { 
  children: ReactNode; 
  dict: Dictionary;
  locale: Locale;
}) {
  return (
    <I18nContext.Provider value={{ dict, locale }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
