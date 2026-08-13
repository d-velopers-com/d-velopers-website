import { describe, expect, it } from "vitest";

import { isPrivateIp } from "@/lib/network-security";

describe("isPrivateIp", () => {
  it.each(["8.8.8.8", "1.1.1.1", "2606:4700:4700::1111"])(
    "allows public unicast address %s",
    (address) => expect(isPrivateIp(address)).toBe(false),
  );

  it.each([
    "127.0.0.1",
    "10.0.0.1",
    "172.16.0.1",
    "192.168.0.1",
    "169.254.169.254",
    "::1",
    "fc00::1",
    "fe80::1",
    "::ffff:169.254.169.254",
    "::ffff:ac10:1",
    "not-an-ip",
  ])("blocks non-public address %s", (address) => {
    expect(isPrivateIp(address)).toBe(true);
  });
});
