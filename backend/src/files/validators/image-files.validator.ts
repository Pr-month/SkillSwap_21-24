import { FileValidator } from '@nestjs/common';

export class ImageFilesValidator extends FileValidator<{
  allowedTypes: string[];
}> {
  constructor(
    protected readonly validationOptions: { allowedTypes: string[] },
  ) {
    super(validationOptions);
  }

  isValid(file?: Express.Multer.File): boolean {
    const mime = file?.mimetype || '';
    return this.validationOptions.allowedTypes.includes(mime);
  }

  buildErrorMessage(): string {
    return `Invalid file type. Allowed: ${this.validationOptions.allowedTypes.join(', ')}`;
  }
}
