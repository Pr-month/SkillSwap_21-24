import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('API')
  .setDescription('API documentation')
  .setVersion('1.0')
  .addTag('auth', 'Authentication endpoints')
  .addTag('categories', 'Categories management endpoints')
  .addTag('files', 'Files endpoints')
  .addTag('requests', 'Request management endpoints')
  .addTag('skills', 'Skills management endpoints')
  .addTag('users', 'User management endpoints')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Enter JWT token',
      in: 'header',
    },
    'access-token',
  )

  .build();

export const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    tagsSorter: 'alpha',
    operationsSorter: 'alpha',
    docExpansion: 'none',
    filter: true,
  },
  customSiteTitle: 'Mentor Match API Documentation',
  customCss: `
    .swagger-ui .topbar { display: none; }
    .swagger-ui .info { margin: 20px 0; }
  `,
};
