/** @format */

import { cn } from "@/utils/cn";
import React from "react";

export default function Container(props: React.HTMLProps<HTMLDivElement>) {
  return (
    <div
      {...props}
      className={cn(
        "w-full bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl flex py-4 shadow-sm dark:text-white transition-colors duration-300",
        props.className
      )}
    />
  );
}
