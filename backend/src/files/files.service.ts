import { Injectable } from '@nestjs/common';
import { Express } from 'express';

@Injectable()
export class FilesService {
  handleUpload(file: Express.Multer.File) {
    return {
      originalName: file.originalname,
      savedAs: file.filename,
      size: file.size,
    };
  }
}
