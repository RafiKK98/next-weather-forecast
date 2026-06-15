export function convertTemperature(tempInKelvin: number, unit: "metric" | "imperial" = "metric"): number {
  const celsius = tempInKelvin - 273.15;
  if (unit === "imperial") {
    return Math.floor(celsius * (9 / 5) + 32);
  }
  return Math.floor(celsius);
}
