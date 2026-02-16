import type { PrefillResult, ProductType } from "../ports/XmlPrefillService.js";

export interface XmlReaderStrategy {
  canHandle(xmlObj: unknown): boolean;
  parse(product: ProductType, xmlObj: unknown): Omit<PrefillResult, "source">;
}
