// Mock crop price recommendation service
// In production, this would connect to real market data APIs

export interface CropPriceRecommendation {
  cropName: string;
  recommendedPrice: number;
  marketPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  unit: string;
  lastUpdated: string;
  marketTrend: 'up' | 'down' | 'stable';
  factors: string[];
}

const cropDatabase: Record<string, CropPriceRecommendation> = {
  rice: {
    cropName: 'Rice',
    recommendedPrice: 2800,
    marketPrice: 2650,
    priceRange: { min: 2500, max: 3000 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'up',
    factors: ['High demand in urban markets', 'Good quality expected', 'Seasonal price increase']
  },
  wheat: {
    cropName: 'Wheat',
    recommendedPrice: 2200,
    marketPrice: 2150,
    priceRange: { min: 2000, max: 2400 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'stable',
    factors: ['Stable demand', 'Average quality expected', 'Government procurement available']
  },
  corn: {
    cropName: 'Corn',
    recommendedPrice: 1800,
    marketPrice: 1750,
    priceRange: { min: 1600, max: 2000 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'up',
    factors: ['Feed industry demand', 'Export opportunities', 'Weather concerns in other regions']
  },
  sugarcane: {
    cropName: 'Sugarcane',
    recommendedPrice: 350,
    marketPrice: 320,
    priceRange: { min: 300, max: 380 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'up',
    factors: ['Sugar mill procurement', 'Good sugar recovery rate', 'Festival season demand']
  },
  tomato: {
    cropName: 'Tomato',
    recommendedPrice: 2500,
    marketPrice: 2200,
    priceRange: { min: 1800, max: 3000 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'up',
    factors: ['Cold storage shortage', 'High restaurant demand', 'Transport cost increase']
  },
  onion: {
    cropName: 'Onion',
    recommendedPrice: 1200,
    marketPrice: 1100,
    priceRange: { min: 900, max: 1500 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'stable',
    factors: ['Steady household demand', 'Storage availability', 'Government buffer stock']
  },
  potato: {
    cropName: 'Potato',
    recommendedPrice: 800,
    marketPrice: 750,
    priceRange: { min: 600, max: 1000 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'down',
    factors: ['Oversupply in market', 'Good storage conditions', 'Import competition']
  },
  cotton: {
    cropName: 'Cotton',
    recommendedPrice: 6200,
    marketPrice: 5800,
    priceRange: { min: 5500, max: 6500 },
    unit: 'per quintal',
    lastUpdated: '2024-01-22',
    marketTrend: 'up',
    factors: ['Textile industry recovery', 'Export demand rising', 'Quality premium available']
  }
};

export function getCropPriceRecommendation(cropName: string): CropPriceRecommendation | null {
  const normalizedName = cropName.toLowerCase().trim();
  
  // Direct match
  if (cropDatabase[normalizedName]) {
    return cropDatabase[normalizedName];
  }
  
  // Partial match
  const matchedKey = Object.keys(cropDatabase).find(key => 
    key.includes(normalizedName) || normalizedName.includes(key)
  );
  
  if (matchedKey) {
    return cropDatabase[matchedKey];
  }
  
  return null;
}

export function searchCrops(query: string): string[] {
  if (!query || query.length < 2) return [];
  
  const normalizedQuery = query.toLowerCase();
  return Object.keys(cropDatabase)
    .filter(crop => crop.includes(normalizedQuery) || cropDatabase[crop].cropName.toLowerCase().includes(normalizedQuery))
    .map(key => cropDatabase[key].cropName)
    .slice(0, 5);
}

export function getAllCrops(): string[] {
  return Object.values(cropDatabase).map(crop => crop.cropName);
}