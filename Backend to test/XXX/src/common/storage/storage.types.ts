export interface StoredFileRef {
  key: string;
  url: string;
}

export interface UploadInputFile {
  buffer: Buffer;
  mimetype: string;
  originalname: string;
  size: number;
}

export interface UploadContext {
  ownerId: string;
  kind: 'justificatif';
}
