/** @format */
"use client";

import React, { useState } from "react";
import { MdOutlineLocationOn } from "react-icons/md";
import { MdMyLocation, MdDarkMode, MdLightMode } from "react-icons/md";
import SearchBox from "./SearchBox";
import { loadingCityAtom, placeAtom } from "@/store/atom";
import { useAtom } from "jotai";
import { useTheme } from "next-themes";

type Props = { location?: string };

export default function Navbar({ location }: Props) {
  const [city, setCity] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [place, setPlace] = useAtom(placeAtom);
  const [_, setLoadingCity] = useAtom(loadingCityAtom);
  const { theme, setTheme } = useTheme();

  async function handleInputChang(value: string) {
    setCity(value);
    if (value.length >= 3) {
      try {
        const response = await fetch(`/api/weather?type=find&q=${value}`);
        if (!response.ok) throw new Error("Failed to fetch suggestions");
        
        const data = await response.json();
        const newSuggestions = data.list.map((item: { name: string }) => item.name);
        setSuggestions(newSuggestions);
        setError("");
        setShowSuggestions(true);
      } catch (error) {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }

  function handleSuggestionClick(value: string) {
    setCity(value);
    setShowSuggestions(false);
  }

  function handleSubmitSearch(e: React.FormEvent<HTMLFormElement>) {
    setLoadingCity(true);
    e.preventDefault();
    if (suggestions.length === 0) {
      setError("Location not found");
      setLoadingCity(false);
    } else {
      setError("");
      setTimeout(() => {
        setLoadingCity(false);
        setPlace(city);
        setShowSuggestions(false);
      }, 500);
    }
  }

  function handleCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          setLoadingCity(true);
          const response = await fetch(`/api/weather?type=weather&lat=${latitude}&lon=${longitude}`);
          if (!response.ok) throw new Error("Failed to fetch location data");
          
          const data = await response.json();
          setTimeout(() => {
            setLoadingCity(false);
            setPlace(data.name);
          }, 500);
        } catch (error) {
          setLoadingCity(false);
        }
      });
    }
  }

  return (
    <>
      <nav className="shadow-sm sticky top-0 left-0 z-50 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="h-[80px] w-full flex justify-between items-center max-w-7xl px-3 mx-auto">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-gray-900 dark:text-gray-100 text-3xl font-bold">Weather <span className="text-blue-500">&</span> Forecast</h2>
          </div>
          <section className="flex gap-4 items-center">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-2xl text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            >
              {theme === 'dark' ? <MdLightMode /> : <MdDarkMode />}
            </button>
            <MdMyLocation
              title="Your Current Location"
              onClick={handleCurrentLocation}
              className="text-2xl text-gray-500 hover:opacity-80 cursor-pointer dark:text-gray-300"
            />
            <div className="flex items-center gap-1">
              <MdOutlineLocationOn className="text-3xl text-gray-900 dark:text-gray-100" />
              <p className="text-gray-700 dark:text-gray-300 text-sm font-medium"> {location} </p>
            </div>
            <div className="relative hidden md:flex">
              <SearchBox
                value={city}
                onSubmit={handleSubmitSearch}
                onChange={(e) => handleInputChang(e.target.value)}
              />
              <SuggestionBox
                {...{
                  showSuggestions,
                  suggestions,
                  handleSuggestionClick,
                  error
                }}
              />
            </div>
          </section>
        </div>
      </nav>
      <section className="flex max-w-7xl px-3 md:hidden ">
        <div className="relative ">
          <SearchBox
            value={city}
            onSubmit={handleSubmitSearch}
            onChange={(e) => handleInputChang(e.target.value)}
          />
          <SuggestionBox
            {...{
              showSuggestions,
              suggestions,
              handleSuggestionClick,
              error
            }}
          />
        </div>
      </section>
    </>
  );
}

function SuggestionBox({
  showSuggestions,
  suggestions,
  handleSuggestionClick,
  error
}: {
  showSuggestions: boolean;
  suggestions: string[];
  handleSuggestionClick: (item: string) => void;
  error: string;
}) {
  return (
    <>
      {((showSuggestions && suggestions.length > 1) || error) && (
        <ul className="mb-4 bg-white dark:bg-gray-800 absolute border top-[44px] left-0 border-gray-300 dark:border-gray-700 rounded-md min-w-[200px] flex flex-col gap-1 py-2 px-2 shadow-lg">
          {error && suggestions.length < 1 && (
            <li className="text-red-500 p-1 "> {error}</li>
          )}
          {suggestions.map((item, i) => (
            <li
              key={i}
              onClick={() => handleSuggestionClick(item)}
              className="cursor-pointer p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-white transition-colors"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
