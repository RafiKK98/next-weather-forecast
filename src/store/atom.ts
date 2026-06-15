import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const placeAtom = atomWithStorage("weather-place", "Dhaka");

export const loadingCityAtom = atom(false);

export const savedLocationsAtom = atomWithStorage<string[]>("weather-saved-locations", []);

export const unitAtom = atomWithStorage<"metric" | "imperial">("weather-unit", "metric");
