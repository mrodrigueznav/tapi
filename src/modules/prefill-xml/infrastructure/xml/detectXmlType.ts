import type { XmlReaderStrategy } from "../../domain/strategies/XmlReaderStrategy.js";

export function detectStrategy(xmlObj: unknown, strategies: XmlReaderStrategy[]): XmlReaderStrategy {
  for (const s of strategies) {
    if (s.canHandle(xmlObj)) return s;
  }
  const unknown = strategies.find((s) => (s as { name?: string }).name === "UnknownStrategy");
  if (unknown) return unknown;
  throw new Error("No strategy found");
}
