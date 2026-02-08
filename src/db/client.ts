import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

const EXPO_PUBLIC_DB_NAME = 'earn_burn.db';

const expoDb = openDatabaseSync(EXPO_PUBLIC_DB_NAME);

export const db = drizzle(expoDb, { schema });
