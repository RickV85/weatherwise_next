import { Session } from "inspector";
import { ForecastData } from "../Interfaces/interfaces";
import { UserLocation } from "../Classes/UserLocation";

// NOAA API CALLS

export async function fetchNoaaGridLocation(coords: string) {
  const response = await fetch(`https://api.weather.gov/points/${coords}`);
  if (!response.ok) {
    throw new Error("Request to fetch location grid point failed.");
  }
  return response.json();
}

export async function fetchNoaaGridLocationWithRetry(
  coords: string,
  retries: number = 5,
  delay: number = 2000
) {
  for (let i = 1; i <= retries; i++) {
    try {
      return await fetchNoaaGridLocation(coords);
    } catch (err) {
      console.error(
        `Fetch NOAA grid location attempt ${i} failed for coordinates: ${coords}`
      );
      if (i === retries) {
        throw new Error(
          `All attempts to fetch NOAA grid location failed for coordinates: ${coords}.`
        );
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error();
}

export async function fetchDailyForecast(url: string): Promise<ForecastData> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Request to fetch daily forecast failed.");
  }
  return response.json();
}

export async function fetchDailyForecastWithRetry(
  url: string,
  retries: number = 5,
  delay: number = 2000
): Promise<ForecastData> {
  for (let i = 1; i <= retries; i++) {
    try {
      return await fetchDailyForecast(url);
    } catch (err) {
      console.error(
        `Fetch Daily Forecast attempt ${i} failed for forecastUrl: ${url}`
      );
      if (i === retries) {
        throw new Error("All fetch Daily Forecast attempts failed.");
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw new Error();
}

// VERCEL POSTGRES DB CALLS

// For immediate DB update, bypass caching with this header:
// { cache: "no-store" }
// Otherwise use Next revalidation time in seconds:
// { next: { revalidate: 3600 } }
// which validates data at maximum once an hour

export async function getAllDefaultLocations() {
  try {
    const response = await fetch("/api/default_locations", {
      next: {
        revalidate: 3600,
      },
    });
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(error?.toString());
  }
}

export async function getAllUserLocations(userId: string) {
  try {
    const response = await fetch(`/api/user_locations?user_id=${userId}`, {
      cache: "no-store",
    });
    const result = await response.json();
    return result;
  } catch (error) {
    throw new Error(error?.toString());
  }
}

interface NewUserLoc {
  name: string;
  latitude: string;
  longitude: string;
  user_id: string;
  poi_type: string;
}

export async function postNewUserLocation(userLoc: NewUserLoc) {
  try {
    const response = await fetch("/api/user_locations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userLoc),
      credentials: "include",
    });

    if (response.status === 201) {
      return await response.json();
    } else {
      const errorData = await response.json();
      throw new Error("Error response postNewUserLocation:", errorData);
    }
  } catch (error) {
    throw error;
  }
}
