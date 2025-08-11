import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

type UploadCoverParams = {
  userId: string;
  fileBuffer: Buffer;
  contentType: string;
  fileName: string;
};

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly bucketName: string;
  private readonly region: string;

  constructor() {
    this.region = process.env.AWS_REGION ?? '';
    this.bucketName = process.env.AWS_S3_BUCKET ?? '';

    if (!this.region || !this.bucketName) {
      throw new Error('AWS_REGION e AWS_S3_BUCKET devem estar configuradas');
    }

    this.s3Client = new S3Client({
      region: this.region,
      // Credenciais serão obtidas automaticamente das envs pelo provider chain
    });
  }

  async uploadCoverImage(
    params: UploadCoverParams,
  ): Promise<{ key: string; url: string }> {
    const { userId, fileBuffer, contentType, fileName } = params;

    const objectKey = `users/${userId}/covers/${this.generateObjectName(fileName)}`;

    const logPrefix = `bucket=${this.bucketName} | region=${this.region} | key=${objectKey}`;

    const put = async (useAcl: boolean) => {
      const input: any = {
        Bucket: this.bucketName,
        Key: objectKey,
        Body: fileBuffer,
        ContentType: contentType,
      };
      if (useAcl) {
        input.ACL = 'public-read';
      }
      return this.s3Client.send(new PutObjectCommand(input));
    };

    try {
      await put(true);
    } catch (error) {
      const err = error as any;
      const code = err?.name || err?.Code || err?.code;

      // Buckets com Object Ownership "Bucket owner enforced" não suportam ACL
      const aclUnsupported =
        code === 'AccessControlListNotSupported' ||
        code === 'InvalidRequest' ||
        /ACL/i.test(err?.message ?? '');

      if (!aclUnsupported) {
        throw new InternalServerErrorException('Falha ao enviar arquivo ao S3');
      }

      try {
        await put(false);
      } catch (retryError) {
        throw new InternalServerErrorException('Falha ao enviar arquivo ao S3');
      }
    }
    return { key: objectKey, url: this.getPublicUrl(objectKey) };
  }

  getPublicUrl(key: string): string {
    return `https://${this.bucketName}.s3.${this.region}.amazonaws.com/${key}`;
  }

  private generateObjectName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).slice(2, 8);
    const base = this.sanitizeFileName(originalName);
    return `${timestamp}-${random}-${base}`;
  }

  private sanitizeFileName(name: string): string {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-\.]/g, '')
      .replace(/-+/g, '-')
      .replace(/^[-\.]+|[-\.]+$/g, '');
  }
}
