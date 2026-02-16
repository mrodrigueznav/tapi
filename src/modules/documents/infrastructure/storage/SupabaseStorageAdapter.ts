import { supabase } from "../../../../config/supabase.js";
import type { StoragePort } from "../../domain/ports/StoragePort.js";

export class SupabaseStorageAdapter implements StoragePort {
  async upload(bucket: string, key: string, buffer: Buffer, mimeType: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).upload(key, buffer, {
      contentType: mimeType,
      upsert: true,
    });
    if (error) throw new Error(`Supabase upload failed: ${error.message}`);
  }

  async createSignedUrl(bucket: string, key: string, ttlSeconds: number): Promise<string> {
    const { data, error } = await supabase.storage.from(bucket).createSignedUrl(key, ttlSeconds);
    if (error) throw new Error(`Supabase signed URL failed: ${error.message}`);
    if (!data?.signedUrl) throw new Error("No signed URL returned");
    return data.signedUrl;
  }

  async remove(bucket: string, key: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([key]);
    if (error) throw new Error(`Supabase remove failed: ${error.message}`);
  }
}
