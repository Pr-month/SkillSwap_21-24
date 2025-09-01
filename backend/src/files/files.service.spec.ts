import { FilesService } from './files.service';
import { Readable } from 'stream';

describe('FilesService', () => {
  let service: FilesService;

  class EmptyStream extends Readable {
    _read(size: number) {}
  }

  beforeEach(() => {
    service = new FilesService();
  });

  it('Process uploaded file correctly', () => {
    const fakeFile: Express.Multer.File = {
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      destination: '/tmp/uploads/',
      filename: 'random_filename.jpg',
      path: '/tmp/uploads/random_filename.jpg',
      size: 1024,
      stream: new EmptyStream(),
      buffer: Buffer.alloc(1024),
    };

    const result = service.handleUpload(fakeFile);

    expect(result).toStrictEqual({
      originalName: 'test.jpg',
      savedAs: 'random_filename.jpg',
      size: 1024,
    });
  });
});
