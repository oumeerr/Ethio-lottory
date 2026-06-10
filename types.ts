
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    query_id?: string;
    user?: TelegramUser;
    receiver?: TelegramUser;
    start_param?: string;
    auth_date: number;
    hash: string;
  };
  version: string;
  platform: string;
  colorScheme: "light" | "dark";
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: {
    isVisible: boolean;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    isProgressVisible: boolean;
    setText: (text: string) => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    showProgress: (leaveActive: boolean) => void;
    hideProgress: () => void;
    setParams: (params: {
      text?: string;
      color?: string;
      text_color?: string;
      is_active?: boolean;
      is_visible?: boolean;
    }) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
  CloudStorage: {
    setItem: (key: string, value: string, callback?: (error: unknown, success: boolean) => void) => void;
    getItem: (key: string, callback: (error: unknown, value: string) => void) => void;
    getItems: (keys: string[], callback: (error: unknown, values: Record<string, string>) => void) => void;
    removeItem: (key: string, callback?: (error: unknown, success: boolean) => void) => void;
    removeItems: (keys: string[], callback?: (error: unknown, success: boolean) => void) => void;
    getKeys: (callback: (error: unknown, keys: string[]) => void) => void;
  };
  requestContact: (callback: (success: boolean) => void) => void;
  expand: () => void;
  close: () => void;
  ready: () => void;
  isVersionAtLeast: (version: string) => boolean;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export interface SupabaseProfile {
  id: string;
  telegram_id: number;
  username: string;
  phone?: string;
  balance: number;
  bonus_balance: number;
  games_played: number;
  games_won: number;
  games_won_after_deposit: number;
  has_deposited: boolean;
  referrals_count: number;
  profile_picture_url?: string;
  is_admin?: boolean;
}

export enum Language {
  ENGLISH = 'en',
  AMHARIC = 'am',
  OROMOO = 'om',
  TIGRINYA = 'ti'
}

export type View = 'home' | 'wallet' | 'leaderboard' | 'history' | 'profile' | 'how-to-play' | 'betting-list' | 'card-selection' | 'game' | 'promo' | 'settings' | 'all-cards' | 'payment-proof' | 'sql-admin';

export interface BingoCard {
  id: number;
  grid: number[][]; // 5x5
}

export interface DBTable {
  name: string;
  columns: string[];
}

export interface User {
  id: string; // UUID from Supabase
  telegram_id: number;
  username: string;
  profile_picture_url?: string;
  mobile: string; // Alias for phone in some UI parts
  phone?: string;
  balance: number;
  bonus_balance: number;
  games_played: number;
  games_won: number;
  games_won_after_deposit: number;
  has_deposited: boolean;
  referrer_id?: number;
  referrals: number; // Derived/Mocked in UI sometimes
  photo: string; // Alias for profile_picture_url
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "transfer" | "bonus";
  amount: number;
  status: "pending" | "completed" | "failed";
  created_at: string;
  recipient_username?: string;
  metadata?: {
    method?: string;
    bank?: string;
    accountNumber?: string;
    reason?: string;
  };
}

export interface Bank {
  id: string;
  name: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  timestamp: number;
  mood: 'lucky' | 'neutral' | 'tilted';
}
