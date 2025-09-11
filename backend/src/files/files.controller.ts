import {
  Controller,
  Post,
  UnprocessableEntityException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { FilesService } from './files.service';

@ApiTags('Файлы')
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @ApiOperation({ summary: 'Загрузка файла' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Файл успешно загружен и обработан' })
  @ApiUnprocessableEntityResponse({
    description: 'Ошибка обработки файла (неверный формат или размер)',
  })
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new UnprocessableEntityException('Invalid file type');
    }

    return this.filesService.handleUpload(file);
  }
}
