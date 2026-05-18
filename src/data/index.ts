/**
 * Data Access Layer
 * 
 * This module is the single source of truth for all application data.
 * Components should NEVER import from JSON files directly or hold hardcoded
 * data — they import from here.
 * 
 * In production, this layer would be replaced with API calls to a backend
 * service. The function signatures here mirror what a REST or GraphQL API
 * would expose.
 * 
 * Architecture:
 * - Read functions: Pure functions that query data with optional transformations
 * - Write functions: Mutate data through the store layer (pub/sub pattern)
 * - Query helpers: Composable filters and aggregations for common queries
 */

import wardrobeData from './wardrobe.json';
import outfitsData from './outfits.json';
import tagsData from './tags.json';
import userData from './user.json';
import appConfig from './app-config.json';

// Stores for write operations (pub/sub pattern)
import {
  addItem as storeAddItem,
  updateItem as storeUpdateItem,
  removeItem as storeRemoveItem,
  getItems as storeGetItems,
  getNextClosetId as storeGetNextClosetId,
} from '../app/store/wardrobe';

// Static image imports mapped by filename
import imgWhiteShirt from '../imports/white-shirtt.png';
import imgWoolSweater from '../imports/Wool_Sweater.png';
import imgShirt from '../imports/shirt.png';
import imgGreenHoodie from '../imports/Cozy_green_hoodie.png';
import imgBlackHoodie from '../imports/Black_hoodie.png';
import imgShortPants from '../imports/short_pants.png';
import imgShortJeans from '../imports/Short_jeans.png';
import imgPant from '../imports/pant.png';
import imgJeansTrouser from '../imports/Jeans_Trouser.png';
import imgRunningShoes from '../imports/Running_Shoes.png';
import imgArmyBoots from '../imports/Black_army_Boots.png';
import imgWhiteSneakers from '../imports/White_Sneakers.jpg';
import imgBlackShoe from '../imports/Black_Women_Shoe.png';
import imgPendant from '../imports/Love_Pendant.png';
import imgBlackScarf from '../imports/Black_Scarf.png';
import imgHandBag from '../imports/Ladies_Hand_Bag.png';
import imgBlackBag from '../imports/Black_Women_Bag.png';
import imgFurCoat from '../imports/Fur_Coat_White.png';
import imgBrownCoat from '../imports/JV5ValTWqon74HBBj53sjUyzc07UOH1MPWOGg7AL1SFeKfVUUd3vV5UgT0c49op6D5Hm5jtXYHJrcR9sOvGhj49BWj8Y5uvxmnAq7hUMDgiCrErE4MD18aiyKE7p8COdRtgIthqJ34ObkDEKFhy5FEzrXKPGGhwFjf0i7viupU1x1Oc618ILI39mFy7jGAAG.jpg';
import imgJeans from '../imports/jeans.png';
import imgCargoPants from '../imports/Stylish_Olive_Cargo_Pants_with_Multiple_Pockets.png';
import imgFourPocketJacket from '../imports/Four_Pocket_Jacket.png';
import imgBlueSweater from '../imports/blue_sweater-1.png';
import imgShoppingBag from '../imports/Shopping_Bag-1.png';
import imgAvatar from '../imports/ChatGPT_Image_2026_5_13__17_27_04.png';
import imgRect from '../imports/image-1.png';
import imgHour from '../imports/image-2.png';
import imgPear from '../imports/image-3.png';
import imgApple from '../imports/image-4.png';
import imgInv from '../imports/image-5.png';
import imgMannequin1 from '../imports/file_00000000ac6c7206b0ffc4af338ca472.png';
import imgAvatar1 from '../imports/file_000000009b4c7207acc65bca74088e0b.png';
import imgMannequin2 from '../imports/file_000000004d3c71fa83b0fc076565130c.png';
import imgAvatar2 from '../imports/file_00000000dad472098b367017fe90c1df.png';
import imgMannequin3 from '../imports/file_00000000fa48720981ed96a40f5d5d67.png';
import imgAvatar3 from '../imports/file_000000000d7c7206badf63333abfad20.png';

// Static image path mapping
const IMAGE_MAP: Record<string, string> = {
  'white-shirtt.png': imgWhiteShirt,
  'Wool_Sweater.png': imgWoolSweater,
  'shirt.png': imgShirt,
  'Cozy_green_hoodie.png': imgGreenHoodie,
  'Black_hoodie.png': imgBlackHoodie,
  'short_pants.png': imgShortPants,
  'Short_jeans.png': imgShortJeans,
  'pant.png': imgPant,
  'Jeans_Trouser.png': imgJeansTrouser,
  'Running_Shoes.png': imgRunningShoes,
  'Black_army_Boots.png': imgArmyBoots,
  'White_Sneakers.jpg': imgWhiteSneakers,
  'Black_Women_Shoe.png': imgBlackShoe,
  'Love_Pendant.png': imgPendant,
  'Black_Scarf.png': imgBlackScarf,
  'Ladies_Hand_Bag.png': imgHandBag,
  'Black_Women_Bag.png': imgBlackBag,
  'Fur_Coat_White.png': imgFurCoat,
  'JV5ValTWqon74HBBj53sjUyzc07UOH1MPWOGg7AL1SFeKfVUUd3vV5UgT0c49op6D5Hm5jtXYHJrcR9sOvGhj49BWj8Y5uvxmnAq7hUMDgiCrErE4MD18aiyKE7p8COdRtgIthqJ34ObkDEKFhy5FEzrXKPGGhwFjf0i7viupU1x1Oc618ILI39mFy7jGAAG.jpg': imgBrownCoat,
  'jeans.png': imgJeans,
  'Stylish_Olive_Cargo_Pants_with_Multiple_Pockets.png': imgCargoPants,
  'Four_Pocket_Jacket.png': imgFourPocketJacket,
  'blue_sweater-1.png': imgBlueSweater,
  'Shopping_Bag-1.png': imgShoppingBag,
  'ChatGPT_Image_2026_5_13__17_27_04.png': imgAvatar,
  'image-1.png': imgRect,
  'image-2.png': imgHour,
  'image-3.png': imgPear,
  'image-4.png': imgApple,
  'image-5.png': imgInv,
  'file_00000000ac6c7206b0ffc4af338ca472.png': imgMannequin1,
  'file_000000009b4c7207acc65bca74088e0b.png': imgAvatar1,
  'file_000000004d3c71fa83b0fc076565130c.png': imgMannequin2,
  'file_00000000dad472098b367017fe90c1df.png': imgAvatar2,
  'file_00000000fa48720981ed96a40f5d5d67.png': imgMannequin3,
  'file_000000000d7c7206badf63333abfad20.png': imgAvatar3,
};

/* ═══════════════════════════════════════════════════════════════
   TYPE DEFINITIONS
   ═══════════════════════════════════════════════════════════════ */

export interface ClothingItem {
  id: string;
  closetId?: string;
  name: string;
  type: string;
  color: string;
  colorHex: string;
  comment: string;
  wearCount: number;
  lastWorn?: string;  // ISO date string, e.g. "2026-05-10"
  styles: string[];
  seasons: string[];
  image?: string;    // Original filename from JSON
  imageUrl?: string; // Resolved URL for display
  emoji: string;
}

export interface OutfitItem {
  id: string;
  type: string;
  emoji: string;
  color: string;
  colorHex: string;
  image?: string;
  imageUrl?: string;
  name: string;
}

export interface OutfitRecord {
  id: string;
  date: string;
  style: string;
  label: string;
  mannequinImage: string;
  mannequinImageUrl?: string;
  avatarImage: string;
  avatarImageUrl?: string;
  outfitItems: OutfitItem[];
}

export interface OutfitCollection {
  id: string;
  name: string;
  purpose: string;
  dateFrom?: string;
  dateTo?: string;
  outfitIds: string[];
}

export interface ColorEntry {
  name: string;
  hex: string;
  light?: boolean;
}

export interface ToneEntry {
  name: string;
  colors: string[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatarImage?: string;
  avatarImageUrl?: string;
  measurements: {
    height: string;
    bust: string;
    waist: string;
    hips: string;
  };
  bodyType: string;
  stylePreferences: string[];
}

export interface BodyTypeEntry {
  key: string;
  label: string;
  image: string;
  imageUrl?: string;
}

export interface CalendarConfig {
  year: number;
  todayDate: string;
  yesterdayDate: string;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
  percentage: number;
}

/* ═══════════════════════════════════════════════════════════════
   IMAGE RESOLUTION
   ═══════════════════════════════════════════════════════════════ */

/**
 * Resolves an image filename to its URL using static import mapping
 */
export const getImagePath = (filename: string | undefined | null): string | undefined => {
  if (!filename) return undefined;
  return IMAGE_MAP[filename];
};

function resolveOutfitItemImages(item: Omit<OutfitItem, 'imageUrl'>): OutfitItem {
  return { ...item, imageUrl: getImagePath(item.image) };
}

/* ═══════════════════════════════════════════════════════════════
   DATE UTILITIES (use configured "today", NOT real Date)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Calculate days since last worn using configured today date
 */
export const getDaysSinceLastWorn = (
  lastWornDate: string | undefined,
  referenceDate?: string
): number | null => {
  if (!lastWornDate) return null;
  const reference = referenceDate ?? getTodayDate();
  const lastWorn = new Date(lastWornDate);
  const today = new Date(reference);
  const diffTime = today.getTime() - lastWorn.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Format last worn date as human-readable text
 */
export const formatLastWorn = (lastWornDate: string | undefined, referenceDate?: string): string => {
  if (!lastWornDate) return 'Unknown';
  const days = getDaysSinceLastWorn(lastWornDate, referenceDate);
  if (days === null) return 'Unknown';
  if (days === 0) return 'Today';
  if (days === 1) return '1d ago';
  if (days >= 90) return '90+ days';
  return `${days}d ago`;
};

/* ═══════════════════════════════════════════════════════════════
   WARDROBE READ FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

export const getWardrobeItems = (): ClothingItem[] => {
  return wardrobeData.items.map(item => ({
    ...item,
    imageUrl: getImagePath(item.image),
  }));
};

export const getWardrobeItem = (id: string): ClothingItem | undefined => {
  const item = wardrobeData.items.find(i => i.id === id);
  if (!item) return undefined;
  return { ...item, imageUrl: getImagePath(item.image) };
};

/* ═══════════════════════════════════════════════════════════════
   WARDROBE WRITE FUNCTIONS (Repository Pattern)
   ═══════════════════════════════════════════════════════════════ */

/**
 * Add a new wardrobe item
 */
export const addWardrobeItem = (item: Omit<ClothingItem, 'id' | 'closetId'>): ClothingItem => {
  const newItem: ClothingItem = {
    ...item,
    id: Date.now().toString(),
    closetId: storeGetNextClosetId(),
    imageUrl: getImagePath(item.image),
  };
  storeAddItem(newItem);
  return newItem;
};

/**
 * Update an existing wardrobe item
 */
export const updateWardrobeItem = (updatedItem: ClothingItem): void => {
  storeUpdateItem(updatedItem);
};

/**
 * Delete a wardrobe item
 */
export const deleteWardrobeItem = (id: string): void => {
  storeRemoveItem(id);
};

/* ═══════════════════════════════════════════════════════════════
   WARDROBE QUERY HELPERS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Get wardrobe items filtered by category
 */
export const getWardrobeItemsByCategory = (category: string): ClothingItem[] => {
  return getWardrobeItems().filter(item =>
    item.type.toLowerCase() === category.toLowerCase()
  );
};

/**
 * Get wardrobe items filtered by color
 */
export const getWardrobeItemsByColor = (colorName: string): ClothingItem[] => {
  return getWardrobeItems().filter(item =>
    item.color.toLowerCase() === colorName.toLowerCase()
  );
};

/**
 * Get wardrobe items filtered by style
 */
export const getWardrobeItemsByStyle = (style: string): ClothingItem[] => {
  return getWardrobeItems().filter(item =>
    item.styles.some(s => s.toLowerCase() === style.toLowerCase())
  );
};

/**
 * Get idle items (items not worn recently)
 * @param thresholdDays - Items not worn in this many days are considered idle (default: 30)
 */
export const getIdleItems = (thresholdDays: number = 30): ClothingItem[] => {
  const referenceDate = getTodayDate();
  return getWardrobeItems()
    .map(item => ({
      item,
      daysSince: getDaysSinceLastWorn(item.lastWorn, referenceDate),
    }))
    .filter(({ daysSince }) => daysSince !== null && daysSince >= thresholdDays)
    .map(({ item }) => item);
};

/**
 * Get most worn items by wear count
 * @param limit - Number of items to return (default: 3)
 */
export const getMostWornItems = (limit: number = 3): ClothingItem[] => {
  return [...getWardrobeItems()]
    .sort((a, b) => b.wearCount - a.wearCount)
    .slice(0, limit);
};

/**
 * Get category breakdown statistics
 */
export const getCategoryBreakdown = (): CategoryBreakdown[] => {
  const items = getWardrobeItems();
  const total = items.length;
  const counts: Record<string, number> = {};

  items.forEach(item => {
    counts[item.type] = (counts[item.type] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([category, count]) => ({
      category,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
};

/* ═══════════════════════════════════════════════════════════════
   OUTFITS READ FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

export const getInitialOutfits = (): OutfitRecord[] => {
  return outfitsData.outfits.map(outfit => ({
    ...outfit,
    mannequinImageUrl: getImagePath(outfit.mannequinImage),
    avatarImageUrl: getImagePath(outfit.avatarImage),
    outfitItems: outfit.outfitItems.map(resolveOutfitItemImages),
  }));
};

export const getOutfitsByDateRange = (startDate: string, endDate: string): OutfitRecord[] => {
  return getInitialOutfits().filter(
    outfit => outfit.date >= startDate && outfit.date <= endDate
  );
};

export const getOutfitCollections = (): OutfitCollection[] => {
  return outfitsData.collections;
};

/* ═══════════════════════════════════════════════════════════════
   OUTFITS WRITE FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

/**
 * Add a new outfit (note: currently persists only in memory)
 */
export const addOutfit = (outfit: Omit<OutfitRecord, 'id'>): OutfitRecord => {
  const newOutfit: OutfitRecord = {
    ...outfit,
    id: `O${Date.now()}`,
  };
  // TODO: Implement outfit store persistence
  return newOutfit;
};

/**
 * Update an existing outfit
 */
export const updateOutfit = (updatedOutfit: OutfitRecord): void => {
  // TODO: Implement outfit store persistence
  console.log('Update outfit:', updatedOutfit);
};

/**
 * Delete an outfit
 */
export const deleteOutfit = (id: string): void => {
  // TODO: Implement outfit store persistence
  console.log('Delete outfit:', id);
};

/* ═══════════════════════════════════════════════════════════════
   TAGS ACCESSORS
   ═══════════════════════════════════════════════════════════════ */

export const getStyleTags = (): string[] => tagsData.styles;
export const getCategories = (): string[] => tagsData.categories;
export const getSeasons = (): string[] => tagsData.seasons;
export const getColorPalette = (): ColorEntry[] => tagsData.colors;
export const getColorTones = (): ToneEntry[] => tagsData.tones;

/**
 * Add a new style tag
 */
export const addStyleTag = (tag: string): void => {
  if (!tagsData.styles.includes(tag)) {
    tagsData.styles.push(tag);
  }
};

/* ═══════════════════════════════════════════════════════════════
   USER ACCESSORS
   ═══════════════════════════════════════════════════════════════ */

export const getUserProfile = (): UserProfile => ({
  ...userData.profile,
  avatarImageUrl: getImagePath(userData.profile.avatarImage),
});

export const getBodyTypes = (): BodyTypeEntry[] => {
  return userData.bodyTypes.map(bt => ({
    ...bt,
    imageUrl: getImagePath(bt.image),
  }));
};

/**
 * Update user profile
 */
export const updateUserProfile = (updates: Partial<UserProfile>): void => {
  Object.assign(userData.profile, updates);
};

/* ═══════════════════════════════════════════════════════════════
   APP CONFIG ACCESSORS
   ═══════════════════════════════════════════════════════════════ */

export const getTodayDate = (): string => appConfig.calendar.todayDate;
export const getYesterdayDate = (): string => appConfig.calendar.yesterdayDate;
export const getCalendarYear = (): number => appConfig.calendar.year;
export const getMonthNames = (): string[] => appConfig.months;
export const getCalendarConfig = (): CalendarConfig => appConfig.calendar;

/* ═══════════════════════════════════════════════════════════════
   DATA INTEGRITY CHECK
   ═══════════════════════════════════════════════════════════════ */

/**
 * Run integrity checks on data consistency
 * Returns array of issues found (empty if all checks pass)
 */
export const runDataIntegrityCheck = (): string[] => {
  const issues: string[] = [];
  const images = new Set(
    // Extract just filenames from the imports folder
    [
      '1778775742907.png', '840.jpg', 'Black_Scarf.png', 'Black_Women_Bag.png',
      'Black_Women_Shoe.png', 'Black_army_Boots-1.png', 'Black_army_Boots.png',
      'Black_hoodie.png', 'ChatGPT_Image_2026_5_13__17_27_04.png',
      'ChatGPT_Image_2026_5_5__11_00_40.png', 'ChatGPT_Image_2026_5_5__11_04_05.png',
      'Cozy_green_hoodie.png', 'Four_Pocket_Jacket.png', 'Fur_Coat_White.png',
      'JV5ValTWqon74HBBj53sjUyzc07UOH1MPWOGg7AL1SFeKfVUUd3vV5UgT0c49op6D5Hm5jtXYHJrcR9sOvGhj49BWj8Y5uvxmnAq7hUMDgiCrErE4MD18aiyKE7p8COdRtgIthqJ34ObkDEKFhy5FEzrXKPGGhwFjf0i7viupU1x1Oc618ILI39mFy7jGAAG.jpg',
      'Jeans_Trouser.png', 'Ladies_Hand_Bag.png', 'Love_Pendant.png',
      'Running_Shoes.png', 'Screenshot_2026-05-05_at_23.54.58.png',
      'Shopping_Bag-1.png', 'Shopping_Bag.png', 'Short_jeans.png',
      'Stylish_Olive_Cargo_Pants_with_Multiple_Pockets.png', 'White_Sneakers.jpg',
      'Wool_Sweater.png', '_____20260505224223_348_6.png',
      '_____20260509170336_423_6-1.png', '_____20260509170336_423_6.png',
      'blue_sweater-1.png', 'blue_sweater.png',
      'file_000000000d7c7206badf63333abfad20.png',
      'file_000000004d3c71fa83b0fc076565130c.png',
      'file_000000009b4c7207acc65bca74088e0b.png',
      'file_00000000ac6c7206b0ffc4af338ca472.png',
      'file_00000000dad472098b367017fe90c1df.png',
      'file_00000000fa48720981ed96a40f5d5d67.png',
      'image-1.png', 'image-2.png', 'image-3.png', 'image-4.png', 'image-5.png',
      'image.png', 'jeans.png', 'pant-1.png', 'pant.png',
      'shirt.png', 'short_pants.png', 'white-shirtt.png',
    ]
  );

  // Check 1: wardrobe images exist
  wardrobeData.items.forEach(item => {
    if (item.image && !images.has(item.image)) {
      issues.push(`Wardrobe item "${item.name}" (${item.id}): image "${item.image}" not found in imports/`);
    }
  });

  // Check 2: outfit item references exist in wardrobe
  const wardrobeIds = new Set(wardrobeData.items.map(i => i.id));
  outfitsData.outfits.forEach(outfit => {
    outfit.outfitItems.forEach(oi => {
      if (!wardrobeIds.has(oi.id)) {
        issues.push(`Outfit "${outfit.label}" (${outfit.id}): references item id "${oi.id}" which doesn't exist in wardrobe`);
      }
    });
  });

  // Check 3: user style preferences exist in tags
  const validStyles = new Set(tagsData.styles);
  userData.profile.stylePreferences.forEach(pref => {
    if (!validStyles.has(pref)) {
      issues.push(`User profile: style preference "${pref}" not found in tags.json styles`);
    }
  });

  return issues;
};
