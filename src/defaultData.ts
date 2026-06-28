import { LifeOSData } from './types';

export const getInitialData = (): LifeOSData => {
  const today = new Date().toISOString().split('T')[0];
  
  // Helpers for offset dates
  const offsetDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  // Create initial demo data
  const defaultData: LifeOSData = {
    calendarMarks: [],
    subjects: [],
    assignments: [],
    exams: [],
    timelineTasks: [],
    focusLogs: [],
    habits: [],
    moodLogs: [],
    journals: [],
    goals: [],
    finances: [],
    memories: [],
    visionBoard: [],
    bucketList: [],
    userXP: 0,
    userLevel: 1,
    settings: {
      userName: "Tanishka",
      avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Tanishka",
      notificationsEnabled: true,
      weatherLocation: "Delhi",
      savedCities: ["Delhi"],
      theme: "elegant",
      displayDensity: "spacious",
      customQuote: "Your life is your own masterwork. Sculpt it daily with pristine intent.",
      customQuoteAuthor: "Marcus Aurelius"
    }
  };

  return defaultData;
};

export const saveToStorage = (data: LifeOSData) => {
  localStorage.setItem('lifeos_data', JSON.stringify(data));
};
