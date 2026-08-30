import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LocalStorageService } from './local-storage.service';
import { R2StorageService } from './r2-storage.service';

@Injectable()
export class FileStorageService {
  constructor(
    private readonly config: ConfigService,
    private readonly local: LocalStorageService,
    private readonly r2: R2StorageService,
  ) {}

  isLocal() {
    return this.driver() === 'local';
  }

  createUploadUrl(input: { fileId?: string; storageKey: string; mimeType: string }) {
    if (this.isLocal()) {
      if (!input.fileId) throw new ServiceUnavailableException('A file id is required for local storage.');
      return this.local.createUploadUrl({ fileId: input.fileId, storageKey: input.storageKey });
    }
    return this.r2.createUploadUrl(input);
  }

  readObjectMetadata(storageKey: string, mimeType: string) {
    return this.isLocal()
      ? this.local.readObjectMetadata(storageKey, mimeType)
      : this.r2.readObjectMetadata(storageKey);
  }

  createDownloadUrl(input: { fileId: string; storageKey: string }) {
    return this.isLocal()
      ? this.local.createDownloadUrl(input)
      : this.r2.createDownloadUrl(input.storageKey);
  }

  deleteObject(storageKey: string) {
    return this.isLocal() ? this.local.deleteObject(storageKey) : this.r2.deleteObject(storageKey);
  }

  writeLocalObject(input: Parameters<LocalStorageService['writeObject']>[0]) {
    if (!this.isLocal()) throw new ServiceUnavailableException('Local file storage is not enabled.');
    return this.local.writeObject(input);
  }

  readLocalObject(input: Parameters<LocalStorageService['readObject']>[0]) {
    if (!this.isLocal()) throw new ServiceUnavailableException('Local file storage is not enabled.');
    return this.local.readObject(input);
  }

  private driver() {
    const value = (this.config.get<string>('FILE_STORAGE_DRIVER') ?? 'local').toLowerCase();
    if (value === 'local' || value === 'r2') return value;
    throw new ServiceUnavailableException('FILE_STORAGE_DRIVER must be either local or r2.');
  }
}
