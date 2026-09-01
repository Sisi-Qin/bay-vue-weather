export type WeatherKind = "Fog" | "Cloud" | "Overcast" | "Clear" | "Rain" | "Drizzle";

export type WeatherDay = {
  date: string;
  label: string;
  weather: WeatherKind;
  minTemp: number;
  maxTemp: number;
  rainChance: number;
};

const raw: Array<[string, WeatherKind, number, number, number]> = [
  ["Feb 01", "Fog", 52, 58, 20],
  ["Feb 02", "Cloud", 53, 59, 12],
  ["Feb 03", "Overcast", 54, 60, 30],
  ["Feb 04", "Rain", 54, 58, 70],
  ["Feb 05", "Fog", 53, 59, 18],
  ["Feb 06", "Clear", 54, 62, 8],
  ["Feb 07", "Cloud", 55, 63, 14],
  ["Feb 08", "Drizzle", 55, 60, 50],
  ["Feb 09", "Fog", 54, 61, 24],
  ["Feb 10", "Clear", 55, 64, 10],
  ["Feb 11", "Cloud", 56, 65, 16],
  ["Feb 12", "Overcast", 56, 62, 38],
  ["Feb 13", "Fog", 55, 63, 20],
  ["Feb 14", "Clear", 56, 66, 8],
  ["Feb 15", "Cloud", 57, 67, 12],
  ["Feb 16", "Rain", 57, 61, 88],
  ["Feb 17", "Fog", 56, 64, 30],
  ["Feb 18", "Rain", 56, 59, 100],
  ["Feb 19", "Cloud", 57, 65, 14],
  ["Feb 20", "Clear", 58, 68, 6],
  ["Feb 21", "Fog", 58, 69, 18],
  ["Feb 22", "Overcast", 59, 66, 42],
  ["Feb 23", "Cloud", 59, 70, 22],
  ["Feb 24", "Clear", 60, 72, 10],
  ["Feb 25", "Fog", 60, 71, 16],
  ["Feb 26", "Drizzle", 61, 67, 55],
  ["Feb 27", "Cloud", 61, 73, 28],
  ["Feb 28", "Clear", 62, 74, 12],
  ["Mar 01", "Fog", 62, 75, 20],
  ["Mar 02", "Clear", 63, 78, 8],
];

export const weatherDays: WeatherDay[] = raw.map(
  ([label, weather, minTemp, maxTemp, rainChance]) => ({
    date: label,
    label,
    weather,
    minTemp,
    maxTemp,
    rainChance,
  }),
);

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

export const summary = {
  meanHi: mean(weatherDays.map((d) => d.maxTemp)).toFixed(1),
  meanLo: mean(weatherDays.map((d) => d.minTemp)).toFixed(1),
  rainDays: weatherDays.filter((d) => d.rainChance >= 50).length,
};
