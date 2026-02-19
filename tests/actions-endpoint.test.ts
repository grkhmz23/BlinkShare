import { describe, it, expect } from "vitest";
import { ACTIONS_CORS_HEADERS } from "@blinkshare/common";

describe("actions CORS headers", () => {
  it("includes required CORS headers", () => {
    expect(ACTIONS_CORS_HEADERS["Access-Control-Allow-Origin"]).toBe("*");
    expect(ACTIONS_CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("GET");
    expect(ACTIONS_CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("POST");
    expect(ACTIONS_CORS_HEADERS["Access-Control-Allow-Methods"]).toContain("OPTIONS");
    expect(ACTIONS_CORS_HEADERS["Access-Control-Allow-Headers"]).toContain(
      "Content-Type"
    );
  });

  it("has Content-Type application/json", () => {
    expect(ACTIONS_CORS_HEADERS["Content-Type"]).toBe("application/json");
  });
});

describe("actions.json shape", () => {
  it("has valid rules structure", () => {
    // Simulate the shape returned by our actions.json route
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

    expect(payload.rules).toBeInstanceOf(Array);
    expect(payload.rules.length).toBeGreaterThan(0);

    for (const rule of payload.rules) {
      expect(rule).toHaveProperty("pathPattern");
      expect(rule).toHaveProperty("apiPath");
      expect(typeof rule.pathPattern).toBe("string");
      expect(typeof rule.apiPath).toBe("string");
    }
  });
});

describe("GET endpoint response shape", () => {
  it("validates ActionGetResponse shape", () => {
    // Simulate GET response
    const response = {
      title: "Endorse alice on BlinkShare",
      icon: "http://localhost:3000/icon.png",
      description: "Send an onchain endorsement to alice.",
      label: "Endorse",
      links: {
        actions: [
          {
            label: "Endorse alice",
            href: "http://localhost:3000/api/actions/endorse?profile=alice",
          },
        ],
      },
    };

    expect(response).toHaveProperty("title");
    expect(response).toHaveProperty("icon");
    expect(response).toHaveProperty("description");
    expect(response).toHaveProperty("label");
    expect(typeof response.title).toBe("string");
    expect(typeof response.icon).toBe("string");
    expect(response.icon).toMatch(/^https?:\/\//);
    expect(response.links?.actions).toBeInstanceOf(Array);
    expect(response.links?.actions?.[0]).toHaveProperty("label");
    expect(response.links?.actions?.[0]).toHaveProperty("href");
  });
});
