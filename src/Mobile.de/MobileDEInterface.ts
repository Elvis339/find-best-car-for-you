import { MobileDEAdditionalProps } from ".";
import { cheerio } from "cheerio";

export interface MobileDEInterface {
  car: string;
  model: string;
  additional: MobileDEAdditionalProps;
  buildUrl: (carId: number, mobileId: number) => string;
  getCarId: () => number;
  getModelId: () => Promise<number>;
  getCarUrls: (urls: typeof cheerio) => string[];
  makeRequest: () => Promise<void>;
}
