import { Car } from "../Entities/Car";

export interface Repository {
  createCar: (data: Car[]) => void;
}

export type findByOpts = {
  column: keyof Car;
  searchBy: string;
};
