export interface PrefillFields {
  importeTotal?: string;
  fechaDocumento?: string;
  emisorRfc?: string;
  emisorNombre?: string;
  receptorRfc?: string;
  receptorNombre?: string;
  [key: string]: unknown;
}

export interface PrefillResult {
  fields: PrefillFields;
  warnings: string[];
  source: string;
}

export type ProductType = "IMSS" | "RCV" | "INFONAVIT";

export interface XmlPrefillServicePort {
  parse(product: ProductType, xmlContent: string): Promise<PrefillResult>;
}
