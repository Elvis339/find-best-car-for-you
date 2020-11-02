import { Car } from "../Entities/Car";

export interface Repository {
  createCar: () => void;
}

export type findByOpts = {
  column: keyof Car;
  searchBy: string;
};
