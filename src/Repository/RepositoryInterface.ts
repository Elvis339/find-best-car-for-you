import { Car } from "../Entities/Car";
import { History } from "../Entities/History";

export interface Repository {
  insert: (...args: any) => void;
  update: () => void;
  delete: (where: unknown) => void;
  getOneBy: (...args: any) => Promise<unknown | null>;
  getBy: (...args: any) => Promise<unknown | null>;
  getAll: () => Promise<unknown[] | null>;
}

export type findByOpts = {
  column: keyof Car | keyof History;
  searchBy: string;
  select?: string | "*";
};
