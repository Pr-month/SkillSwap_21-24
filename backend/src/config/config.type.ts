import { ConfigType } from '@nestjs/config';
import { configuration } from './configuration';

export type AppConfigType = ConfigType<typeof configuration>;
