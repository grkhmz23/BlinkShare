import { NextResponse } from "next/server";
import { ACTIONS_CORS_HEADERS } from "@blinkshare/common";

export async function GET() {
  const payload = {
    rules: [
      {
        pathPattern: "/u/*",
        apiPath: "/api/actions/endorse?profile=*",
      },
      {
        pathPattern: "/api/actions/**",
        apiPath: "/api/actions/**",
      },
    ],
  };

  return NextResponse.json(payload, {
    headers: ACTIONS_CORS_HEADERS,
  });
}
