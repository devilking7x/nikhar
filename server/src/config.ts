import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// dist/index.js -> ../../web/dist
export const WEB_DIST = path.resolve(here, '../../web/dist');
export const GARMENT_DIR = path.join(WEB_DIST, 'garments');
