import { NextResponse } from "next/server";

const API_KEY = process.env.OPENWEATHERMAP_API_KEY || "6a74d0568f1e312900c750047ab804ef";
const BASE_URL = "https://api.openweathermap.org/data/2.5";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // forecast, find, or weather
  
  if (!type) {
    return NextResponse.json({ error: "Missing type parameter" }, { status: 400 });
  }

  let url = "";

  try {
    if (type === "forecast") {
      const q = searchParams.get("q");
      if (!q) return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
      url = `${BASE_URL}/forecast?q=${q}&appid=${API_KEY}&cnt=56`;
    } else if (type === "find") {
      const q = searchParams.get("q");
      if (!q) return NextResponse.json({ error: "Missing q parameter" }, { status: 400 });
      url = `${BASE_URL}/find?q=${q}&appid=${API_KEY}`;
    } else if (type === "weather") {
      const lat = searchParams.get("lat");
      const lon = searchParams.get("lon");
      if (!lat || !lon) return NextResponse.json({ error: "Missing lat/lon" }, { status: 400 });
      url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    } else {
      return NextResponse.json({ error: "Invalid type parameter" }, { status: 400 });
    }

    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.message || "Failed to fetch data" }, { status: res.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
