/** @format */

import { cn } from "@/utils/cn";
import Image from "next/image";
import { HTMLProps } from "react";

type Props = HTMLProps<HTMLDivElement> & { iconName: string };

export default function WeatherIcon({ iconName, className, ...rest }: Props) {
  return (
    <div
      {...rest}
      title={iconName}
      className={cn("relative w-20 h-20", className)}
    >
      <Image
        width={100}
        height={100}
        alt="weather-icon"
        className="absolute w-full h-full"
        src={`https://openweathermap.org/img/wn/${iconName}@4x.png`}
      />
    </div>
  );
}
