export enum Queries {
  createCarTable = `
    CREATE TABLE IF NOT EXISTS cars (
        id INTEGER PRIMARY KEY,
        name VARCHAR NOT NULL,
        car_id INTEGER NOT NULL,
        model_id INTEGER NOT NULL,
        first_registration VARCHAR NOT NULL,
        transmission VARCHAR(20) NOT NULL,
        fuel_type VARCHAR(20) NOT NULL,
        vehicle_type VARCHAR(20) NOT NULL,
        url VARCHAR NOT NULL,
        img_url STRING NOT NULL,
        price INTEGER NOT NULL,
        description TEXT
    );`,
  insertIntoCar = `INSERT INTO cars(name, car_id, model_id, first_registration, url, img_url, price, description, transmission, fuel_type, vehicle_type) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
}
