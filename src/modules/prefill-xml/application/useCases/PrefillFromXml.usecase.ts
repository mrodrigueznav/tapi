import type { PrefillResult, ProductType } from "../../domain/ports/XmlPrefillService.js";
import { parseXml } from "../../infrastructure/xml/xmlParser.js";
import { detectStrategy } from "../../infrastructure/xml/detectXmlType.js";
import type { XmlReaderStrategy } from "../../domain/strategies/XmlReaderStrategy.js";

export interface PrefillFromXmlCommand {
  product: ProductType;
  xmlContent: string;
}

export function buildPrefillFromXml(
  strategies: XmlReaderStrategy[]
): (cmd: PrefillFromXmlCommand) => Promise<PrefillResult> {
  return async function prefillFromXml(cmd: PrefillFromXmlCommand): Promise<PrefillResult> {
    const xmlObj = parseXml(cmd.xmlContent);
    const strategy = detectStrategy(xmlObj, strategies);
    const { fields, warnings } = strategy.parse(cmd.product, xmlObj);
    return {
      fields,
      warnings,
      source: "xml",
    };
  };
}
