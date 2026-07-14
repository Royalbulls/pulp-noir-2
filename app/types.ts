export type MusicConcept = {
  title: string;
  genre: string;
  mood: string;
  description: string;
  instruments: string[];
};

export type StoryChoice = {
  text: string;
  impact: string;
  type: string;
};

export type StoryPart = {
  uid: string;
  threadId?: string;
  type: 'text' | 'image' | 'joke' | 'character' | 'script' | 'song' | 'reconstruction' | 'video' | 'item-song' | 'masterlist' | 'life-journey' | 'pulp-noir-story' | 'audio' | 'story';
  content: string;
  id: string;
  choices?: (string | StoryChoice)[];
  selectedChoice?: string;
  feedback?: 'up' | 'down';
  audioUrl?: string;
  musicUrl?: string;
  bpm?: number;
  musicConcept?: MusicConcept;
  isSpeaking?: boolean;
  isPaused?: boolean;
  isGeneratingMusic?: boolean;
  isGeneratingNarration?: boolean;
  isSaved?: boolean;
  isPublic?: boolean;
  createdAt: number;
  tags?: string[];
  matchScore?: number;
  isFlagged?: boolean;
  moderationReason?: string;
  storyLinkId?: string;
};

export type WorldLore = {
  id: string;
  title: string;
  description: string;
  location?: string;
  createdAt: number;
};

export type Draft = {
  id: string;
  text: string;
  createdAt: number;
};

export type Character = {
  id: string;
  name: string;
  personality: string;
  motivations: string;
  flaws: string;
  backstory: string;
  role: string;
  archetype: string;
  gender: string;
  dob: string;
  tob: string;
  pob: string;
  kundli: string;
  isActive: boolean;
  createdAt: number;
  avatarUrl?: string;
};

export type UserBadge = {
  id: string;
  name: string;
  brief: string;
  icon: string;
  dateEarned: number;
  missionId: string;
};

export type MissionData = {
  id: string;
  title: string;
  missionBrief: string;
  objective: string;
  potentialBadgeName: string;
  potentialBadgeIcon: string;
  createdAt: number;
  roleConstraint?: string;
};

export type UserProfile = {
  uid?: string;
  genres: string[];
  intensity: 'mild' | 'moderate' | 'extreme';
  elements: string[];
  voice: 'Fenrir' | 'Puck' | 'Charon' | 'Kore' | 'Zephyr';
  selectedVoiceCloneId?: string;
  visualStyle?: string;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  visualMood?: string;
  musicRegion?: string;
  isPro?: boolean;
  isActivated?: boolean;
  activeCharacterId?: string;
  naughtyMode?: boolean;
  conflictEngine?: boolean;
  webSeriesMode?: boolean;
  bundelkhandiMode?: boolean;
  photoURL?: string;
  customName?: string;
  freeTrail?: boolean;
  preferredRole?: 'hero' | 'villain' | 'aam-aadami' | 'none';
  subscriptionType?: 'monthly' | 'yearly' | 'lifetime' | 'trial' | 'none';
  subscriptionExpiry?: number;
  evolution?: {
    version: string;
    totalGenerations: number;
    positiveFeedback: number;
    negativeFeedback: number;
    currentFocus: string;
    earnedBadges?: UserBadge[];
    dailyMission?: MissionData;
  };
  billingConfigured?: boolean;
};

export type VoiceClone = {
  id: string;
  name: string;
  sampleData: string;
  analysis?: string;
  isPrimary?: boolean;
  createdAt: number;
};
