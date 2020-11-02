export interface PAResponse {
  brandName: string;
  brandID: number;
  modelList: [
    {
      modelName: string;
      modelID: string;
      groupModel: boolean;
    }
  ];
}
