import { describe, expect, it } from "vitest";

import { sortPublicUsersByPriority } from "@/lib/user";

describe("public users ordering", () => {
  it("prioritizes allowed roles first and then joinedServerAt ascending", () => {
    process.env.ALLOWED_ROLES = "role-alpha,role-beta";

    const users = sortPublicUsersByPriority([
      {
        handler: "newer-alpha",
        joinedServerAt: "2024-01-03T00:00:00.000Z",
        roles: ["role-alpha"],
      },
      {
        handler: "older-alpha",
        joinedServerAt: "2024-01-01T00:00:00.000Z",
        roles: ["role-alpha"],
      },
      {
        handler: "beta-user",
        joinedServerAt: "2024-01-02T00:00:00.000Z",
        roles: ["role-beta"],
      },
      {
        handler: "no-role",
        joinedServerAt: "2023-12-31T00:00:00.000Z",
        roles: [],
      },
    ]);

    expect(users.map((user) => user.handler)).toEqual([
      "older-alpha",
      "newer-alpha",
      "beta-user",
      "no-role",
    ]);
  });

  it("keeps users with joinedServerAt ahead of users without it when priorities tie", () => {
    process.env.ALLOWED_ROLES = "role-alpha";

    const users = sortPublicUsersByPriority([
      {
        handler: "without-date",
        joinedServerAt: null,
        roles: [],
      },
      {
        handler: "with-date",
        joinedServerAt: "2024-01-01T00:00:00.000Z",
        roles: [],
      },
    ]);

    expect(users.map((user) => user.handler)).toEqual([
      "with-date",
      "without-date",
    ]);
  });
});
