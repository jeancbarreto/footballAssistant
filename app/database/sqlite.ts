import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'app_data.db';

// Abre o crea la base de datos
export const openDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  return SQLite.openDatabaseAsync(DATABASE_NAME);
};

// Inicializa la base de datos y crea una tabla básica si no existe
export const initializeDatabase = async (db: SQLite.SQLiteDatabase) => {
  const query = `
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS json_store (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT NOT NULL UNIQUE,
      value TEXT NOT NULL
    );
  `;
  await db.execAsync(query);
  console.log('Database initialized');
};

// Guarda un objeto JSON
export const saveData = async (db: SQLite.SQLiteDatabase, key: string, value: any) => {
  const jsonValue = JSON.stringify(value);
  await db.runAsync('INSERT OR REPLACE INTO json_store (key, value) VALUES (?, ?)', [key, jsonValue]);
};

// Obtiene un objeto JSON
export const getData = async (db: SQLite.SQLiteDatabase, key: string): Promise<any | null> => {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM json_store WHERE key = ?', [key]);
  return row ? JSON.parse(row.value) : null;
};

// Elimina un objeto JSON
export const deleteData = async (db: SQLite.SQLiteDatabase, key: string) => {
  await db.runAsync('DELETE FROM json_store WHERE key = ?', [key]);
  console.log(`Data deleted for key: ${key}`);
};

// Obtiene todos los datos como una lista
export const getAllData = async (db: SQLite.SQLiteDatabase): Promise<{
  [x: string]: string | number | Date; key: string; value: any 
}[]> => {
  const rows = await db.getAllAsync<{ key: string; value: string }>('SELECT key, value FROM json_store');
  return rows.map(row => ({ key: row.key, value: JSON.parse(row.value) }));
};

// Elimina todos los datos de la tabla
export const clearDatabase = async (db: SQLite.SQLiteDatabase) => {
  await db.execAsync('DELETE FROM json_store');
  console.log('Database cleared');
};
