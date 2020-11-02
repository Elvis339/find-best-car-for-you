import Axios, { AxiosResponse } from "axios";
import { ManagerInterface } from "../ManagerInterface";
import axios from "axios";
import { PAResponse } from "./PolovniAutomobiliInterface";

export class PolovniAutomobili {
  private API_URL = "https://www.polovniautomobili.com/json/getModels/26";

  constructor(public car: string, public model: string) {
    this.car = car;
    this.model = model;
  }

  async getCarMetadata() {
    try {
      let carId: number, modelId: number;
      const res: AxiosResponse<PAResponse[]> = await axios.get(this.API_URL);
      res.data.find((car) => {
        if (car.brandName.toLowerCase() === this.car.toLowerCase()) {
          carId = car.brandID;
        }

        car.modelList.find((model) => {
          if (model.modelName.toLowerCase() === this.model.toLowerCase()) {
            modelId = parseInt(model.modelID, 10);
          }
        });
      });
      return {
        carId,
        modelId,
      };
    } catch (error) {}
  }
}
