import { Options } from 'multer';
import { memoryStorage } from 'multer';

export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
];

export const imageUploadOptions: Options = {
  storage: memoryStorage(),
  limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      (req as any).fileValidationError =
        'Formato de imagem inválido. Envie um arquivo JPEG, PNG ou WEBP.';
      return cb(null, false);
    }
    cb(null, true);
  },
};
