import { UserLocation } from "@/app/Classes/UserLocation";
import { sql } from "@vercel/postgres";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userId = await request.nextUrl.searchParams.get("user_id");
    // Could provide another searchParam for id number
    // then if that param, send an individual location
    const userLocations =
      await sql`SELECT * FROM sendtemps.user_locations WHERE user_id = ${userId};`;
    const userLocRows = userLocations.rows;
    console.log(userLocations);
    const response = NextResponse.json(userLocRows, { status: 200 });
    return response;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const newUserLoc = new UserLocation(
      reqBody.name,
      reqBody.latitude,
      reqBody.longitude,
      reqBody.user_id,
      reqBody.poi_type
    );
    console.log(newUserLoc);
    let response;
    // Could add a sql query here to see if this has already been created
    if (newUserLoc) {
      await sql`INSERT INTO sendtemps.user_locations (name, latitude, longitude, user_id, poi_type, date_created, last_modified) VALUES (${newUserLoc.name}, ${newUserLoc.latitude}, ${newUserLoc.longitude}, ${newUserLoc.user_id}, ${newUserLoc.poi_type}, ${newUserLoc.date_created}, ${newUserLoc.last_modified})`;
      response = NextResponse.json(
        `New location "${newUserLoc.name} created for user: ${newUserLoc.user_id}`,
        { status: 201 }
      );
    }
    return response;
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
