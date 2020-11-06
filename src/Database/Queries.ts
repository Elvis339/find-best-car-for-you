export enum Queries {
  createCarTable = `
    CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY,
        name VARCHAR NOT NULL UNIQUE,
        car_id INTEGER NOT NULL,
        model_id INTEGER NOT NULL,
        first_registration TEXT NOT NULL,
        transmission VARCHAR(20) NOT NULL,
        fuel_type VARCHAR(20) NOT NULL,
        vehicle_type VARCHAR(20) NOT NULL,
        url VARCHAR NOT NULL,
        img_url STRING NOT NULL,
        price INTEGER NOT NULL,
        description TEXT
    );
    CREATE UNIQUE INDEX data_idx ON data(id, name);`,
  insertIntoCar = `INSERT OR IGNORE INTO cars(name, car_id, model_id, first_registration, url, img_url, price, description, transmission, fuel_type, vehicle_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  carsSortedByNewstAndCheapest = `SELECT * FROM 'cars' WHERE car_id = '' ORDER BY first_registration DESC, price ASC;`,
  createHistoryTable = `CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY,
    brand_name VARCHAR(20),
    model_name VARCHAR(20),
    first_registration TEXT,
    date_created DATE
  );`,
  insertIntoHistory = `INSERT INTO history(brand_name, model_name, first_registration, date_created) VALUES(?, ?, ?, DateTime('now'));`,
}
