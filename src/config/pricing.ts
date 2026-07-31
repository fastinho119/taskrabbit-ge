/**
 * Centralized pricing & platform configuration for TaskRabbit GE.
 * Modify these values before launch — all amounts are in Georgian Lari (GEL, ₾).
 */

export const CURRENCY = {
  code: "GEL",
  symbol: "₾",
  locale: "ka-GE",
} as const;

/** Platform commission deducted from tasker payout on completion */
export const PLATFORM_COMMISSION_PERCENT = 15;

/** Minimum task price in GEL */
export const MIN_TASK_PRICE = 30;

/** Maximum task price in GEL */
export const MAX_TASK_PRICE = 5000;

/** Base hourly rate used for time-based estimates */
export const BASE_HOURLY_RATE = 45;

/** Complexity multipliers applied to base category price */
export const COMPLEXITY_MULTIPLIERS = {
  simple: 1.0,
  moderate: 1.5,
  complex: 2.0,
} as const;

export type ComplexityLevel = keyof typeof COMPLEXITY_MULTIPLIERS;

/** Category-specific base prices in GEL */
export const CATEGORY_PRICES: Record<string, number> = {
  plumbing: 80,
  "ac-installation": 150,
  "tv-mounting": 60,
  electrical: 90,
  painting: 100,
  cleaning: 70,
  furniture: 85,
  moving: 120,
};

/** Default categories seeded into the database */
export const DEFAULT_CATEGORIES = [
  { slug: "plumbing", name_ka: "სანტექნიკა", name_en: "Plumbing", icon: "🔧", base_price: 80 },
  { slug: "ac-installation", name_ka: "კონდიციონერის დაყენება", name_en: "AC Installation", icon: "❄️", base_price: 150 },
  { slug: "tv-mounting", name_ka: "ტელევიზორის მონტაჟი", name_en: "TV Mounting", icon: "📺", base_price: 60 },
  { slug: "electrical", name_ka: "ელექტრიკა", name_en: "Electrical", icon: "⚡", base_price: 90 },
  { slug: "painting", name_ka: "მოხატვა", name_en: "Painting", icon: "🎨", base_price: 100 },
  { slug: "cleaning", name_ka: "დასუფთავება", name_en: "Cleaning", icon: "🧹", base_price: 70 },
  { slug: "furniture", name_ka: "ავეჯის შეკრება", name_en: "Furniture Assembly", icon: "🪑", base_price: 85 },
  { slug: "moving", name_ka: "გადაზიდვა", name_en: "Moving Help", icon: "📦", base_price: 120 },
] as const;

/** Tbilisi districts for location filtering */
export const TBILISI_DISTRICTS = [
  "Vake",
  "Saburtalo",
  "Isani",
  "Samgori",
  "Chughureti",
  "Krtsanisi",
  "Mtatsminda",
  "Gldani",
  "Didube",
  "Nadzaladevi",
] as const;

export type TbilisiDistrict = (typeof TBILISI_DISTRICTS)[number];

/** Platform settings defaults (stored in DB, editable by admin) */
export const DEFAULT_PLATFORM_SETTINGS = {
  commission_percent: PLATFORM_COMMISSION_PERCENT,
  min_task_price: MIN_TASK_PRICE,
  max_task_price: MAX_TASK_PRICE,
  currency: CURRENCY.code,
  platform_name: "TaskRabbit GE",
  support_email: "support@taskrabbit.ge",
  support_phone: "+995 555 123 456",
} as const;

export interface PriceEstimateInput {
  categorySlug: string;
  complexity?: ComplexityLevel;
  estimatedHours?: number;
}

export interface PriceEstimate {
  basePrice: number;
  complexityMultiplier: number;
  hoursCost: number;
  estimatedTotal: number;
  commission: number;
  taskerPayout: number;
  currency: string;
}

/** Calculate estimated price for a task */
export function calculatePriceEstimate(input: PriceEstimateInput): PriceEstimate {
  const basePrice = CATEGORY_PRICES[input.categorySlug] ?? BASE_HOURLY_RATE;
  const complexity = input.complexity ?? "simple";
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[complexity];
  const hours = input.estimatedHours ?? 1;
  const hoursCost = BASE_HOURLY_RATE * hours;
  const rawTotal = (basePrice + hoursCost) * complexityMultiplier;
  const estimatedTotal = Math.round(Math.max(MIN_TASK_PRICE, Math.min(MAX_TASK_PRICE, rawTotal)));
  const commission = Math.round(estimatedTotal * (PLATFORM_COMMISSION_PERCENT / 100));
  const taskerPayout = estimatedTotal - commission;

  return {
    basePrice,
    complexityMultiplier,
    hoursCost,
    estimatedTotal,
    commission,
    taskerPayout,
    currency: CURRENCY.code,
  };
}

/** Format amount in GEL */
export function formatGEL(amount: number): string {
  return `${CURRENCY.symbol}${amount.toLocaleString(CURRENCY.locale)}`;
}
