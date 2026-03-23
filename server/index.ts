import 'dotenv/config';
import { loadEnv } from './config/environment.js';
import { startServer } from './server.js';

loadEnv();
startServer();
