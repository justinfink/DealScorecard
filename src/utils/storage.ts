import { OnboardingData } from '../types';

const STORAGE_KEY = 'torchlight_onboarding_data';

export const saveOnboardingData = (data: OnboardingData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

export const loadOnboardingData = (): OnboardingData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    
    const parsed = JSON.parse(data);
    
    // Check if it's the new structure by looking for quickSummary
    if (parsed && parsed.quickSummary) {
      return parsed as OnboardingData;
    }
    
    // Old data structure - return null to use initial data
    console.warn('Old data structure detected, clearing localStorage');
    localStorage.removeItem(STORAGE_KEY);
    return null;
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return null;
  }
};

export const clearOnboardingData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
