/** @format */
"use client";

import Container from "@/components/Container";
import ForecastWeatherDetail from "@/components/ForecastWeatherDetail";
import Navbar from "@/components/Navbar";
import WeatherDetails from "@/components/WeatherDetails";
import WeatherIcon from "@/components/WeatherIcon";
import Footer from "@/components/Footer";
import { convertKelvinToCelsius } from "@/utils/convertKelvinToCelsius";
import { convertWindSpeed } from "@/utils/convertWindSpeed";
import { getDayOrNightIcon } from "@/utils/getDayOrNightIcon";
import { metersToKilometers } from "@/utils/metersToKilometers";
import { format, fromUnixTime, parseISO } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { loadingCityAtom, placeAtom } from "@/store/atom";
import { useAtom } from "jotai";
import { useEffect } from "react";
import { WeatherData } from "@/types/weather";

export default function Home() {
  const [place] = useAtom(placeAtom);
  const [loadingCity] = useAtom(loadingCityAtom);

  const { isLoading, error, data, refetch } = useQuery<WeatherData>({
    queryKey: ["weather", place],
    queryFn: async () => {
      const res = await fetch(`/api/weather?type=forecast&q=${place}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Network response was not ok");
      }
      return res.json();
    }
  });

  useEffect(() => {
    refetch();
  }, [place, refetch]);

  const firstData = data?.list[0];

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt * 1000).toISOString().split("T")[0]
      ) || []
    )
  ];

  // Filtering data to get the first entry after 6 AM for each unique date
  const firstDataForEachDate = uniqueDates.map((date) => {
    return data?.list.find((entry) => {
      const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
      const entryTime = new Date(entry.dt * 1000).getHours();
      return entryDate === date && entryTime >= 6;
    });
  });

  if (isLoading)
    return (
      <div className="flex items-center min-h-screen justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <p className="animate-bounce dark:text-white">Loading...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex items-center min-h-screen justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
        <p className="text-red-500 font-semibold">{error instanceof Error ? error.message : "An error occurred"}</p>
      </div>
    );
    
  return (
    <div className="flex flex-col gap-4 bg-gray-100 dark:bg-gray-900 min-h-screen transition-colors duration-300">
      <Navbar location={data?.city.name} />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4 ">
        {loadingCity ? (
          <WeatherSkeleton />
        ) : (
          <>
            <section className="space-y-4 ">
              <div className="space-y-2">
                <h2 className="flex gap-1 text-2xl items-end dark:text-gray-100">
                  <p>{format(parseISO(firstData?.dt_txt ?? ""), "EEEE")}</p>
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    ({format(parseISO(firstData?.dt_txt ?? ""), "dd.MM.yyyy")})
                  </p>
                </h2>
                <Container className="gap-10 px-6 items-center dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <div className="flex flex-col px-4">
                    <span className="text-5xl">
                      {convertKelvinToCelsius(firstData?.main.temp ?? 296.37)}°
                    </span>
                    <p className="text-xs space-x-1 whitespace-nowrap">
                      <span>Feels like</span>
                      <span>
                        {convertKelvinToCelsius(firstData?.main.feels_like ?? 0)}°
                      </span>
                    </p>
                    <p className="text-xs space-x-2">
                      <span>
                        {convertKelvinToCelsius(firstData?.main.temp_min ?? 0)}°↓
                      </span>
                      <span>
                        {" "}
                        {convertKelvinToCelsius(firstData?.main.temp_max ?? 0)}°↑
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-10 sm:gap-16 overflow-x-auto w-full justify-between pr-3">
                    {data?.list.map((d, i) => (
                      <div
                        key={i}
                        className="flex flex-col justify-between gap-2 items-center text-xs font-semibold"
                      >
                        <p className="whitespace-nowrap">
                          {format(parseISO(d.dt_txt), "h:mm a")}
                        </p>
                        <WeatherIcon
                          iconName={getDayOrNightIcon(d.weather[0].icon, d.dt_txt)}
                        />
                        <p>{convertKelvinToCelsius(d?.main.temp ?? 0)}°</p>
                      </div>
                    ))}
                  </div>
                </Container>
              </div>
              <div className="flex gap-4">
                <Container className="w-fit justify-center flex-col px-4 items-center dark:bg-gray-800 dark:text-white dark:border-gray-700">
                  <p className="capitalize text-center">
                    {firstData?.weather[0].description}
                  </p>
                  <WeatherIcon
                    iconName={getDayOrNightIcon(
                      firstData?.weather[0].icon ?? "",
                      firstData?.dt_txt ?? ""
                    )}
                  />
                </Container>
                <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto dark:bg-yellow-900/40 dark:text-white dark:border-yellow-700/50">
                  <WeatherDetails
                    visibility={metersToKilometers(firstData?.visibility ?? 10000)}
                    airPressure={`${firstData?.main.pressure} hPa`}
                    humidity={`${firstData?.main.humidity}%`}
                    sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702949452), "H:mm")}
                    sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
                    windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}
                  />
                </Container>
              </div>
            </section>

            <section className="flex w-full flex-col gap-4 ">
              <p className="text-2xl dark:text-gray-100">Forecast (7 days)</p>
              {firstDataForEachDate.map((d, i) => (
                <ForecastWeatherDetail
                  key={i}
                  description={d?.weather[0].description ?? ""}
                  weatherIcon={d?.weather[0].icon ?? "01d"}
                  date={format(parseISO(d?.dt_txt ?? ""), "dd.MM")}
                  day={format(parseISO(d?.dt_txt ?? ""), "EEEE")}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa`}
                  humidity={`${d?.main.humidity}%`}
                  sunrise={format(fromUnixTime(data?.city.sunrise ?? 1702517657), "H:mm")}
                  sunset={format(fromUnixTime(data?.city.sunset ?? 1702517657), "H:mm")}
                  visibility={`${metersToKilometers(d?.visibility ?? 10000)}`}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)}`}
                />
              ))}
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}

function WeatherSkeleton() {
  return (
    <section className="space-y-8 ">
      <div className="space-y-2 animate-pulse">
        <div className="flex gap-1 text-2xl items-end ">
          <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-6 w-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="flex flex-col items-center space-y-2">
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
              <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4 animate-pulse">
        <p className="text-2xl h-8 w-36 bg-gray-300 dark:bg-gray-700 rounded"></p>

        {[1, 2, 3, 4, 5, 6, 7].map((index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-4 gap-4 ">
            <div className="h-8 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-10 w-10 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="h-8 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-8 w-28 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        ))}
      </div>
    </section>
  );
}
