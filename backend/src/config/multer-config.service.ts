import { Injectable } from '@nestjs/common';
import {
  MulterModuleOptions,
  MulterOptionsFactory,
} from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuid } from 'uuid';

@Injectable()
export class MulterConfigService implements MulterOptionsFactory {
  createMulterOptions(): MulterModuleOptions {
    return {
      storage: diskStorage({
        destination: './public',
        filename: (_req, file, cb) => {
          const extension = extname(file.originalname).toLowerCase();
          const filename = `${uuid()}${extension}`;
          cb(null, filename);
        },
      }),
      limits: { fileSize: 2 * 1024 * 1024 },
    };
  }
}
