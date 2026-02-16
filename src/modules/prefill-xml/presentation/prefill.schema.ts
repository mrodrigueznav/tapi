import { z } from "zod";

export const productSchema = z.enum(["IMSS", "RCV", "INFONAVIT"]);
export type ProductBody = z.infer<typeof productSchema>;
