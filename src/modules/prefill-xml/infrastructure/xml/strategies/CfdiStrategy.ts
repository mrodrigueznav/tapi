import type { XmlReaderStrategy } from "../../../domain/strategies/XmlReaderStrategy.js";
import type { ProductType } from "../../../domain/ports/XmlPrefillService.js";

function normalizeMoney(value: string | number | undefined): string | undefined {
  if (value === undefined || value === null) return undefined;
  const s = String(value).trim();
  if (!s) return undefined;
  const n = parseFloat(s.replace(/,/g, ""));
  if (Number.isNaN(n)) return undefined;
  return n.toFixed(2);
}

function getAttrFromComprobante(comprobante: unknown, attr: string): string | undefined {
  const o = comprobante as Record<string, unknown>;
  const v = o?.[attr] ?? o?.[`@_${attr}`];
  return typeof v === "string" ? v : undefined;
}

export const CfdiStrategy: XmlReaderStrategy = {
  canHandle(xmlObj: unknown): boolean {
    const o = xmlObj as Record<string, unknown>;
    const cfdi = o?.cfdi as Record<string, unknown> | undefined;
    const cfdi33 = o?.cfdi33 as Record<string, unknown> | undefined;
    return !!(o?.Comprobante ?? cfdi?.Comprobante ?? cfdi33?.Comprobante);
  },

  parse(product: ProductType, xmlObj: unknown) {
    const o = xmlObj as Record<string, unknown>;
    const cfdi = o?.cfdi as Record<string, unknown> | undefined;
    const cfdi33 = o?.cfdi33 as Record<string, unknown> | undefined;
    const comprobante = o?.Comprobante ?? cfdi?.Comprobante ?? cfdi33?.Comprobante;
    if (!comprobante || typeof comprobante !== "object") {
      return { fields: {}, warnings: ["CFDI Comprobante not found"] };
    }
    const attrs = comprobante as Record<string, unknown>;
    const total = getAttrFromComprobante(comprobante, "Total");
    const fecha = getAttrFromComprobante(comprobante, "Fecha");
    const emisor = attrs.Emisor as Record<string, unknown> | undefined;
    const receptor = attrs.Receptor as Record<string, unknown> | undefined;
    const emisorRfc = emisor && typeof emisor.Rfc === "string" ? emisor.Rfc : undefined;
    const emisorNombre = emisor && typeof emisor.Nombre === "string" ? emisor.Nombre : undefined;
    const receptorRfc = receptor && typeof receptor.Rfc === "string" ? receptor.Rfc : undefined;
    const receptorNombre = receptor && typeof receptor.Nombre === "string" ? receptor.Nombre : undefined;

    let fechaDocumento: string | undefined;
    if (fecha) {
      try {
        const d = new Date(fecha);
        if (!Number.isNaN(d.getTime())) {
          fechaDocumento = d.toISOString().slice(0, 10);
        }
      } catch {
        fechaDocumento = undefined;
      }
    }

    const warnings: string[] = [];
    if (product === "IMSS" || product === "RCV") {
      warnings.push("Banco/bimestre/año pueden aplicarse según producto");
    }

    const fields: Record<string, unknown> = {};
    if (normalizeMoney(total) !== undefined) fields.importeTotal = normalizeMoney(total);
    if (fechaDocumento) fields.fechaDocumento = fechaDocumento;
    if (emisorRfc) fields.emisorRfc = emisorRfc;
    if (emisorNombre) fields.emisorNombre = emisorNombre;
    if (receptorRfc) fields.receptorRfc = receptorRfc;
    if (receptorNombre) fields.receptorNombre = receptorNombre;

    return { fields, warnings };
  },
};
