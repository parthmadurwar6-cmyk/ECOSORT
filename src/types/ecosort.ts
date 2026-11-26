export type WasteCategoryId = 'dry' | 'wet' | 'ewaste' | 'hazardous';

export type WasteActionType =
  | 'Recycled'
  | 'Composted'
  | 'Reused'
  | 'E-Waste Disposal'
  | 'Hazardous Drop-Off';

export type NavTab =
  | 'home'
  | 'identify'
  | 'scan'
  | 'centres'
  | 'activity'
  | 'challenges'
  | 'learn'
  | 'dashboard';

export interface CategoryMeta {
  id: WasteCategoryId;
  name: string;
  shortName: string;
  binTitle: string;
  binShort: string;
  subtitle: string;
  accentHex: string;
  bgTintClass: string;
  textColorClass: string;
  borderColorClass: string;
  barColorClass: string;
  defaultAction: WasteActionType;
  basePoints: number;
}

export interface WasteCatalogItem {
  id: string;
  name: string;
  category: WasteCategoryId;
  recommendedAction: string;
  prepSummary: string;
  disposalSteps: string[];
  impactNote: string;
  materialTags: string[];
  aliases: string[];
}

export interface ProbabilityBreakdown {
  dry: number;
  wet: number;
  ewaste: number;
  hazardous: number;
}

export interface ClassificationResult {
  itemName: string;
  detectedSummary: string;
  category: WasteCategoryId;
  categoryLabel: string;
  confidence: number;
  recommendedAction: string;
  prepTip: string;
  disposalSteps: string[];
  probabilityBreakdown: ProbabilityBreakdown;
  materialTags: string[];
  isWasteItem: boolean;
}

export interface RecyclingCentre {
  id: string;
  name: string;
  address: string;
  locality: string;
  materials: string[];
  hours: string;
  phone: string;
  email: string;
  mapX: number;
  mapY: number;
  lat: number;
  lng: number;
  verifiedNote: string;
}

export interface ActivityEntry {
  id: string;
  itemName: string;
  category: WasteCategoryId;
  action: WasteActionType;
  quantity: number;
  date: string;
  notes?: string;
  points: number;
  source?: 'manual' | 'scan' | 'identify';
}

export interface ChallengeItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  bonusPoints: number;
  type: 'streak' | 'counter';
  target: number;
  progress: number;
  completedDays?: boolean[];
  linkedCategory?: WasteCategoryId;
  accentTone: 'forest' | 'blue' | 'amber' | 'emerald';
}

export interface LearningGuide {
  id: string;
  topic: string;
  readTime: string;
  title: string;
  summary: string;
  keyTakeaways: string[];
  fullContent: string[];
}

export interface SampleDemoPhoto {
  id: string;
  label: string;
  imageUrl: string;
  categoryHint: WasteCategoryId;
}
