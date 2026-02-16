import type { XmlReaderStrategy } from "../../../domain/strategies/XmlReaderStrategy.js";
import type { ProductType } from "../../../domain/ports/XmlPrefillService.js";

export const UnknownStrategy: XmlReaderStrategy = {
  canHandle: () => true,
  parse: (_product: ProductType) => ({
    fields: {},
    warnings: ["XML format not recognized; no fields extracted"],
  }),
};
