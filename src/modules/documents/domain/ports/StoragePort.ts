export interface StoragePort {
  upload(bucket: string, key: string, buffer: Buffer, mimeType: string): Promise<void>;
  createSignedUrl(bucket: string, key: string, ttlSeconds: number): Promise<string>;
  remove(bucket: string, key: string): Promise<void>;
}
