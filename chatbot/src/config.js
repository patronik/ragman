import configYaml from 'config-yaml';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const config = configYaml(__dirname + '/config/default.yml');
export default config;