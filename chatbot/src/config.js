import configYaml from 'config-yaml';
import { fileURLToPath } from 'url';
import fs  from 'fs';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!fs.existsSync(__dirname + '/config/default.yml')) {
    throw new Error('Main configuration file is missing.');
}

const config = configYaml(__dirname + '/config/default.yml');
export default config;