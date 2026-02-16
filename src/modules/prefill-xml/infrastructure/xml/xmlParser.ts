import { XMLParser } from "fast-xml-parser";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
});

export function parseXml(xmlContent: string): unknown {
  return parser.parse(xmlContent);
}
