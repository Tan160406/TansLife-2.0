export type SystemTheme = 'galaxy' | 'cyberpunk' | 'sakura' | 'ocean' | 'forest' | 'minimal' | 'midnight' | 'elegant' | 'nordic' | 'sunset' | 'matrix' | 'pastel_pink' | 'royal_velvet' | 'solis_amber' | 'vintage_bronze' | 'vaporwave' | 'emerald_gold' | 'noir_dark';

export type CalendarStatusType = 
  | 'free'
  | 'busy'
  | 'assignment'
  | 'exam'
  | 'appointment'
  | 'holiday'
  | 'family'
  | 'travel'
  | 'study'
  | 'project'
  | 'personal';

export interface CalendarDayMark {
  date: string; // YYYY-MM-DD
  status: CalendarStatusType;
  note?: string;
}

export type CalendarViewType = 'daily' | 'weekly' | 'monthly' | 'heatmap' | 'semester';

export interface Subject {
  id: string;
  name: string;
  color: string;
  attendancePresent: number;
  attendanceTotal: number;
  internalMarks: number;
  internalTotal: number;
  syllabusProgress: number; // 0 - 100
  notesLink?: string;
}

export type AssignmentStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Overdue';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  priority: PriorityLevel;
  deadline: string; // YYYY-MM-DD
  estimatedHours: number;
  status: AssignmentStatus;
  progress: number; // 0 - 100
}

export interface Exam {
  id: string;
  title: string;
  subjectId: string;
  date: string; // YYYY-MM-DDTHH:mm
  syllabusCoverage: number; // 0 - 100
  revisionStatus: 'Not Started' | 'In Progress' | 'Completed';
  confidence: 'Low' | 'Medium' | 'High';
  expectedGrade: string;
}

export interface DailyTimelineTask {
  id: string;
  title: string;
  startTime: string; // HH:MM
  durationMinutes: number;
  completed: boolean;
  category: 'academic' | 'focus' | 'habit' | 'personal' | 'leisure';
}

export interface FocusSessionLog {
  id: string;
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  subjectId?: string;
  type: 'pomodoro' | 'short-break' | 'long-break' | 'custom';
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
}

export interface Habit {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  createdAt: string; // YYYY-MM-DD
  history: string[]; // List of YYYY-MM-DD when completed
  streak: number;
}

export type MoodType = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export interface MoodLog {
  date: string; // YYYY-MM-DD
  mood: MoodType;
  notes?: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string; // YYYY-MM-DD
  tags: string[]; // e.g. #College, #Exams
  voiceNoteUrl?: string; // Simulated voice note text/url
  imageUrl?: string;
}

export interface Goal {
  id: string;
  title: string;
  type: 'long-term' | 'short-term';
  deadline?: string; // YYYY-MM-DD
  progress: number; // 0 - 100
  milestones: { id: string; title: string; completed: boolean }[];
  completed: boolean;
}

export interface FinancialLog {
  id: string;
  type: 'income' | 'expense' | 'savings';
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description: string;
}

export interface MemoryEvent {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  description: string;
  category: 'academic' | 'milestone' | 'travel' | 'personal';
  imageUrl?: string;
}

export interface VisionBoardItem {
  id: string;
  title: string;
  category: 'career' | 'edu' | 'travel' | 'lifestyle';
  imageUrl: string;
  description?: string;
}

export interface BucketListItem {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
  completedDate?: string;
}

export interface ProfileSettings {
  userName: string;
  avatarUrl: string;
  notificationsEnabled: boolean;
  weatherLocation: string;
  weatherUnit?: 'C' | 'F';
  savedCities?: string[];
  theme: SystemTheme;
  displayDensity?: 'compact' | 'spacious';
  customQuote?: string;
  customQuoteAuthor?: string;
}

export interface LifeOSData {
  calendarMarks: CalendarDayMark[];
  subjects: Subject[];
  assignments: Assignment[];
  exams: Exam[];
  timelineTasks: DailyTimelineTask[];
  focusLogs: FocusSessionLog[];
  habits: Habit[];
  moodLogs: MoodLog[];
  journals: JournalEntry[];
  goals: Goal[];
  finances: FinancialLog[];
  memories: MemoryEvent[];
  visionBoard: VisionBoardItem[];
  bucketList: BucketListItem[];
  userXP: number;
  userLevel: number;
  settings: ProfileSettings;
}
