import ipaddr from "ipaddr.js";

/** Returns true for private, local, reserved, multicast, or malformed IPs. */
export function isPrivateIp(address: string): boolean {
  try {
    let parsed = ipaddr.parse(address);

    if (parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress()) {
      parsed = parsed.toIPv4Address();
    }

    return parsed.range() !== "unicast";
  } catch {
    return true;
  }
}
