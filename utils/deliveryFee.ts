/**
 * Interface representing the structure of the `global_settings` table.
 */
export interface GlobalSettings {
  base_fare_1km: number;
  current_fuel_price: number;
  fuel_efficiency: number;
}

/**
 * Calculates the total delivery fee based on the delivery distance and current system settings.
 * 
 * Pricing Logic:
 * - If distance is 1km or less: Flat rate of `base_fare_1km`.
 * - If distance > 1km: `base_fare_1km` + ((distance - 1) * ((fuel_price / efficiency) + 20))
 * Note: The 20 LKR per additional km represents the fixed rider profit.
 * 
 * @param distanceInKm - The total delivery distance in kilometers.
 * @param settings - The `global_settings` configuration fetched from the database.
 * @returns The calculated delivery fee in LKR, rounded up to the nearest whole Rupee.
 */
export function calculateDeliveryFee(distanceInKm: number, settings: GlobalSettings): number {
  // Destructure values matching the global_settings columns
  const { base_fare_1km, current_fuel_price, fuel_efficiency } = settings;

  // Base case: For deliveries under or equal to 1km, charge the minimum base fare.
  if (distanceInKm <= 1) {
    return Math.ceil(base_fare_1km);
  }

  // Calculate the cost for any distance beyond the initial 1km
  const additionalDistance = distanceInKm - 1;
  const fuelCostPerKm = current_fuel_price / fuel_efficiency;
  const riderProfitPerKm = 20; // Fixed profit per additional km
  
  // Calculate total fee
  const totalFee = base_fare_1km + (additionalDistance * (fuelCostPerKm + riderProfitPerKm));

  // Round up to the nearest whole Rupee ensuring no fractional currency amounts
  return Math.ceil(totalFee);
}
