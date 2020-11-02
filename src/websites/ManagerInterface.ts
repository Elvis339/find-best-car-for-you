export interface ManagerInterface {
  getCarId: () => Promise<number | undefined>;
  getModelId: () => Promise<number>;
}
