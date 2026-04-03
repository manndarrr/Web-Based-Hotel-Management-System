// Smart-Sourcing & Cuisine-Specific Stock Risk Analytics Engine

import type { FoodOrder, InventoryItem } from '@/context/HotelContext';

// Dish-to-ingredient mapping (cuisine-specific)
export interface IngredientMapping {
  dish: string;
  cuisine: string;
  ingredients: { name: string; quantityPerServing: number; unit: string }[];
}

export const dishIngredientMap: IngredientMapping[] = [
  // North Indian
  { dish: 'Paneer Butter Masala', cuisine: 'North Indian', ingredients: [
    { name: 'Paneer', quantityPerServing: 0.15, unit: 'kg' },
    { name: 'Butter', quantityPerServing: 0.03, unit: 'kg' },
    { name: 'Tomatoes', quantityPerServing: 0.12, unit: 'kg' },
    { name: 'Fresh Cream', quantityPerServing: 0.04, unit: 'L' },
    { name: 'Onions', quantityPerServing: 0.08, unit: 'kg' },
    { name: 'Garam Masala', quantityPerServing: 0.005, unit: 'kg' },
  ]},
  { dish: 'Dal Makhani', cuisine: 'North Indian', ingredients: [
    { name: 'Butter', quantityPerServing: 0.04, unit: 'kg' },
    { name: 'Fresh Cream', quantityPerServing: 0.05, unit: 'L' },
    { name: 'Tomatoes', quantityPerServing: 0.08, unit: 'kg' },
    { name: 'Onions', quantityPerServing: 0.06, unit: 'kg' },
    { name: 'Garam Masala', quantityPerServing: 0.003, unit: 'kg' },
  ]},
  { dish: 'Butter Naan', cuisine: 'North Indian', ingredients: [
    { name: 'Flour (Maida)', quantityPerServing: 0.08, unit: 'kg' },
    { name: 'Butter', quantityPerServing: 0.015, unit: 'kg' },
    { name: 'Milk', quantityPerServing: 0.03, unit: 'L' },
  ]},
  { dish: 'Lamb Seekh Kebab', cuisine: 'North Indian', ingredients: [
    { name: 'Mutton', quantityPerServing: 0.2, unit: 'kg' },
    { name: 'Onions', quantityPerServing: 0.06, unit: 'kg' },
    { name: 'Garam Masala', quantityPerServing: 0.005, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.03, unit: 'L' },
  ]},
  // Kashmiri
  { dish: 'Authentic Mutton Rogan Josh', cuisine: 'Kashmiri', ingredients: [
    { name: 'Mutton', quantityPerServing: 0.25, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.04, unit: 'L' },
    { name: 'Onions', quantityPerServing: 0.1, unit: 'kg' },
    { name: 'Saffron', quantityPerServing: 0.001, unit: 'kg' },
    { name: 'Garam Masala', quantityPerServing: 0.005, unit: 'kg' },
  ]},
  { dish: 'Gushtaba', cuisine: 'Kashmiri', ingredients: [
    { name: 'Mutton', quantityPerServing: 0.3, unit: 'kg' },
    { name: 'Fresh Cream', quantityPerServing: 0.05, unit: 'L' },
    { name: 'Saffron', quantityPerServing: 0.001, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.03, unit: 'L' },
  ]},
  { dish: 'Traditional Kashmiri Kahwa Tea', cuisine: 'Kashmiri', ingredients: [
    { name: 'Saffron', quantityPerServing: 0.0005, unit: 'kg' },
    { name: 'Sugar', quantityPerServing: 0.01, unit: 'kg' },
  ]},
  // Goan / Seafood
  { dish: 'Authentic Goan Fish Curry', cuisine: 'Goan', ingredients: [
    { name: 'Fish (Fresh)', quantityPerServing: 0.2, unit: 'kg' },
    { name: 'Tomatoes', quantityPerServing: 0.1, unit: 'kg' },
    { name: 'Onions', quantityPerServing: 0.08, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.03, unit: 'L' },
  ]},
  { dish: 'Chicken Cafreal', cuisine: 'Goan', ingredients: [
    { name: 'Chicken Breast', quantityPerServing: 0.2, unit: 'kg' },
    { name: 'Mint Leaves', quantityPerServing: 0.02, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.04, unit: 'L' },
    { name: 'Lemon', quantityPerServing: 1, unit: 'pcs' },
  ]},
  { dish: 'Prawn Balchao', cuisine: 'Goan', ingredients: [
    { name: 'Prawns', quantityPerServing: 0.18, unit: 'kg' },
    { name: 'Tomatoes', quantityPerServing: 0.1, unit: 'kg' },
    { name: 'Onions', quantityPerServing: 0.06, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.03, unit: 'L' },
  ]},
  { dish: 'Bebinca', cuisine: 'Goan', ingredients: [
    { name: 'Eggs', quantityPerServing: 3, unit: 'pcs' },
    { name: 'Sugar', quantityPerServing: 0.05, unit: 'kg' },
    { name: 'Flour (Maida)', quantityPerServing: 0.04, unit: 'kg' },
    { name: 'Butter', quantityPerServing: 0.03, unit: 'kg' },
  ]},
  // Biryani
  { dish: 'Chicken Tikka Biryani', cuisine: 'North Indian', ingredients: [
    { name: 'Chicken Breast', quantityPerServing: 0.2, unit: 'kg' },
    { name: 'Basmati Rice', quantityPerServing: 0.15, unit: 'kg' },
    { name: 'Onions', quantityPerServing: 0.1, unit: 'kg' },
    { name: 'Saffron', quantityPerServing: 0.0005, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.04, unit: 'L' },
    { name: 'Garam Masala', quantityPerServing: 0.005, unit: 'kg' },
  ]},
  // Italian
  { dish: 'Wood-Fired Margherita Pizza', cuisine: 'Continental', ingredients: [
    { name: 'Flour (Maida)', quantityPerServing: 0.15, unit: 'kg' },
    { name: 'Mozzarella', quantityPerServing: 0.12, unit: 'kg' },
    { name: 'Tomatoes', quantityPerServing: 0.08, unit: 'kg' },
    { name: 'Cooking Oil', quantityPerServing: 0.02, unit: 'L' },
  ]},
  { dish: 'Mushroom Risotto', cuisine: 'Continental', ingredients: [
    { name: 'Basmati Rice', quantityPerServing: 0.12, unit: 'kg' },
    { name: 'Butter', quantityPerServing: 0.03, unit: 'kg' },
    { name: 'Fresh Cream', quantityPerServing: 0.05, unit: 'L' },
    { name: 'Mozzarella', quantityPerServing: 0.05, unit: 'kg' },
  ]},
  { dish: 'Classic Tiramisu', cuisine: 'Continental', ingredients: [
    { name: 'Eggs', quantityPerServing: 2, unit: 'pcs' },
    { name: 'Fresh Cream', quantityPerServing: 0.06, unit: 'L' },
    { name: 'Sugar', quantityPerServing: 0.03, unit: 'kg' },
  ]},
  { dish: 'Chocolate Lava Cake', cuisine: 'Continental', ingredients: [
    { name: 'Eggs', quantityPerServing: 2, unit: 'pcs' },
    { name: 'Butter', quantityPerServing: 0.04, unit: 'kg' },
    { name: 'Sugar', quantityPerServing: 0.04, unit: 'kg' },
    { name: 'Flour (Maida)', quantityPerServing: 0.03, unit: 'kg' },
  ]},
  { dish: 'Caesar Salad', cuisine: 'Continental', ingredients: [
    { name: 'Eggs', quantityPerServing: 1, unit: 'pcs' },
    { name: 'Lemon', quantityPerServing: 1, unit: 'pcs' },
    { name: 'Cooking Oil', quantityPerServing: 0.02, unit: 'L' },
  ]},
  // Beverages
  { dish: 'Fresh Lime Soda', cuisine: 'Beverages', ingredients: [
    { name: 'Lemon', quantityPerServing: 2, unit: 'pcs' },
    { name: 'Sugar', quantityPerServing: 0.02, unit: 'kg' },
  ]},
  { dish: 'Mint Mojito', cuisine: 'Beverages', ingredients: [
    { name: 'Mint Leaves', quantityPerServing: 0.02, unit: 'kg' },
    { name: 'Lemon', quantityPerServing: 1, unit: 'pcs' },
    { name: 'Sugar', quantityPerServing: 0.02, unit: 'kg' },
  ]},
  { dish: 'Mango Lassi', cuisine: 'Beverages', ingredients: [
    { name: 'Milk', quantityPerServing: 0.2, unit: 'L' },
    { name: 'Sugar', quantityPerServing: 0.02, unit: 'kg' },
  ]},
];

// ===================== ANALYTICS FUNCTIONS =====================

export interface IngredientPressure {
  ingredientName: string;
  totalDemand24h: number;
  currentStock: number;
  unit: string;
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  depletionHour: string | null; // predicted time of depletion
  suggestion: string;
  cuisineBreakdown: Record<string, number>; // cuisine -> demand count
}

export interface VolatilityScore {
  dishName: string;
  cuisine: string;
  avgDailyOrders: number;
  stdDeviation: number;
  volatilityIndex: number; // 0-100
  peakHours: number[];
  burstRisk: 'Low' | 'Medium' | 'High';
  bufferSuggestion: string;
}

export interface DemandForecast {
  hour: number;
  label: string;
  predictedOrders: number;
  topDishes: { name: string; predicted: number }[];
}

// Calculate hourly order patterns from historical data
function getHourlyPatterns(orders: FoodOrder[]): Record<number, Record<string, number>> {
  const patterns: Record<number, Record<string, number>> = {};
  for (let h = 0; h < 24; h++) patterns[h] = {};

  orders.forEach(o => {
    const hour = new Date(o.timestamp).getHours();
    if (!patterns[hour][o.itemName]) patterns[hour][o.itemName] = 0;
    patterns[hour][o.itemName]++;
  });

  return patterns;
}

// Calculate volatility (standard deviation of daily order counts)
export function calculateVolatility(orders: FoodOrder[]): VolatilityScore[] {
  const dishDailyMap: Record<string, Record<string, number>> = {};
  const dishHourMap: Record<string, Record<number, number>> = {};

  orders.forEach(o => {
    const day = o.timestamp.split('T')[0];
    const hour = new Date(o.timestamp).getHours();

    if (!dishDailyMap[o.itemName]) dishDailyMap[o.itemName] = {};
    if (!dishDailyMap[o.itemName][day]) dishDailyMap[o.itemName][day] = 0;
    dishDailyMap[o.itemName][day]++;

    if (!dishHourMap[o.itemName]) dishHourMap[o.itemName] = {};
    if (!dishHourMap[o.itemName][hour]) dishHourMap[o.itemName][hour] = 0;
    dishHourMap[o.itemName][hour]++;
  });

  const totalDays = new Set(orders.map(o => o.timestamp.split('T')[0])).size || 1;

  return Object.entries(dishDailyMap).map(([dish, dailyCounts]) => {
    const counts = Object.values(dailyCounts);
    const avg = counts.reduce((s, c) => s + c, 0) / totalDays;
    const variance = counts.reduce((s, c) => s + Math.pow(c - avg, 2), 0) / counts.length;
    const stdDev = Math.sqrt(variance);
    const cv = avg > 0 ? (stdDev / avg) * 100 : 0; // coefficient of variation

    const hourCounts = dishHourMap[dish] || {};
    const peakHours = Object.entries(hourCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([h]) => parseInt(h));

    const mapping = dishIngredientMap.find(m => m.dish === dish);
    const cuisine = mapping?.cuisine || 'Other';

    const volatilityIndex = Math.min(100, Math.round(cv));
    const burstRisk: 'Low' | 'Medium' | 'High' = volatilityIndex > 60 ? 'High' : volatilityIndex > 35 ? 'Medium' : 'Low';

    return {
      dishName: dish,
      cuisine,
      avgDailyOrders: Math.round(avg * 10) / 10,
      stdDeviation: Math.round(stdDev * 10) / 10,
      volatilityIndex,
      peakHours,
      burstRisk,
      bufferSuggestion: burstRisk === 'High'
        ? `Keep 40% buffer stock. Burst orders spike at ${peakHours.map(h => `${h}:00`).join(', ')}`
        : burstRisk === 'Medium'
        ? `Keep 20% buffer stock for peak hours`
        : `Standard stock levels sufficient`,
    };
  }).sort((a, b) => b.volatilityIndex - a.volatilityIndex);
}

// Calculate ingredient pressure and stock-out risk
export function calculateIngredientPressure(
  orders: FoodOrder[],
  inventory: InventoryItem[]
): IngredientPressure[] {
  const hourlyPatterns = getHourlyPatterns(orders);
  const totalDays = new Set(orders.map(o => o.timestamp.split('T')[0])).size || 1;
  const currentHour = new Date().getHours();

  // Calculate predicted demand for next 24 hours per ingredient
  const ingredientDemand: Record<string, {
    totalDemand: number;
    cuisineBreakdown: Record<string, number>;
    unit: string;
  }> = {};

  for (let h = 0; h < 24; h++) {
    const targetHour = (currentHour + h) % 24;
    const hourData = hourlyPatterns[targetHour] || {};

    Object.entries(hourData).forEach(([dish, count]) => {
      const avgCount = count / totalDays;
      const mapping = dishIngredientMap.find(m => m.dish === dish);
      if (!mapping) return;

      mapping.ingredients.forEach(ing => {
        if (!ingredientDemand[ing.name]) {
          ingredientDemand[ing.name] = { totalDemand: 0, cuisineBreakdown: {}, unit: ing.unit };
        }
        const demand = avgCount * ing.quantityPerServing;
        ingredientDemand[ing.name].totalDemand += demand;

        if (!ingredientDemand[ing.name].cuisineBreakdown[mapping.cuisine]) {
          ingredientDemand[ing.name].cuisineBreakdown[mapping.cuisine] = 0;
        }
        ingredientDemand[ing.name].cuisineBreakdown[mapping.cuisine] += demand;
      });
    });
  }

  return Object.entries(ingredientDemand).map(([name, data]) => {
    const invItem = inventory.find(i => i.name === name);
    const currentStock = invItem?.quantity || 0;
    const unit = invItem?.unit || data.unit;

    const riskRatio = currentStock > 0 ? data.totalDemand / currentStock : 1;
    const riskScore = Math.min(100, Math.round(riskRatio * 100));

    let riskLevel: IngredientPressure['riskLevel'] = 'Low';
    if (riskScore >= 80) riskLevel = 'Critical';
    else if (riskScore >= 60) riskLevel = 'High';
    else if (riskScore >= 40) riskLevel = 'Medium';

    // Estimate depletion time
    let depletionHour: string | null = null;
    if (riskScore >= 60 && currentStock > 0) {
      const hourlyRate = data.totalDemand / 24;
      const hoursLeft = currentStock / hourlyRate;
      const depTime = new Date();
      depTime.setHours(depTime.getHours() + Math.floor(hoursLeft));
      depletionHour = depTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    }

    let suggestion = '';
    if (riskLevel === 'Critical') {
      suggestion = `${name} projected to deplete by ${depletionHour || 'end of shift'}. Suggest prepping ${Math.ceil(data.totalDemand * 0.2)} ${unit} extra immediately.`;
    } else if (riskLevel === 'High') {
      suggestion = `${name} running low. Prep 20% extra (${Math.ceil(data.totalDemand * 0.2)} ${unit}) for next shift.`;
    } else if (riskLevel === 'Medium') {
      suggestion = `Monitor ${name} stock through peak hours.`;
    } else {
      suggestion = `${name} stock is healthy for next 24h.`;
    }

    return {
      ingredientName: name,
      totalDemand24h: Math.round(data.totalDemand * 100) / 100,
      currentStock,
      unit,
      riskScore,
      riskLevel,
      depletionHour,
      suggestion,
      cuisineBreakdown: data.cuisineBreakdown,
    };
  }).sort((a, b) => b.riskScore - a.riskScore);
}

// Generate 24-hour demand forecast
export function generateDemandForecast(orders: FoodOrder[]): DemandForecast[] {
  const hourlyPatterns = getHourlyPatterns(orders);
  const totalDays = new Set(orders.map(o => o.timestamp.split('T')[0])).size || 1;
  const currentHour = new Date().getHours();

  const forecasts: DemandForecast[] = [];

  for (let h = 0; h < 24; h++) {
    const targetHour = (currentHour + h) % 24;
    const hourData = hourlyPatterns[targetHour] || {};

    const totalPredicted = Object.values(hourData).reduce((s, c) => s + Math.round(c / totalDays), 0);
    const topDishes = Object.entries(hourData)
      .map(([name, count]) => ({ name, predicted: Math.round(count / totalDays) }))
      .sort((a, b) => b.predicted - a.predicted)
      .slice(0, 3);

    const ampm = targetHour >= 12 ? 'PM' : 'AM';
    const displayHour = targetHour === 0 ? 12 : targetHour > 12 ? targetHour - 12 : targetHour;

    forecasts.push({
      hour: targetHour,
      label: `${displayHour}${ampm}`,
      predictedOrders: totalPredicted,
      topDishes,
    });
  }

  return forecasts;
}

// Get menu item availability status based on inventory
export interface MenuItemAvailability {
  dishName: string;
  available: boolean;
  status: 'Available' | 'Limited' | 'Out of Stock';
  remainingServings: number | null;
}

export function getMenuAvailability(
  inventory: InventoryItem[]
): Record<string, MenuItemAvailability> {
  const result: Record<string, MenuItemAvailability> = {};

  dishIngredientMap.forEach(mapping => {
    let minServings = Infinity;
    let hasOutOfStock = false;

    mapping.ingredients.forEach(ing => {
      const invItem = inventory.find(i => i.name === ing.name);
      const stock = invItem?.quantity || 0;
      if (ing.quantityPerServing > 0) {
        const possibleServings = Math.floor(stock / ing.quantityPerServing);
        minServings = Math.min(minServings, possibleServings);
        if (possibleServings === 0) hasOutOfStock = true;
      }
    });

    if (minServings === Infinity) minServings = 99;

    result[mapping.dish] = {
      dishName: mapping.dish,
      available: !hasOutOfStock,
      status: hasOutOfStock ? 'Out of Stock' : minServings <= 5 ? 'Limited' : 'Available',
      remainingServings: minServings <= 20 ? minServings : null,
    };
  });

  return result;
}
