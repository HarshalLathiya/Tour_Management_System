import { BaseModel } from "./BaseModel";

export class StateModel extends BaseModel {
  constructor() {
    super("states");
  }
}

export class CityModel extends BaseModel {
  constructor() {
    super("cities");
  }

  async getByStateId(stateId: number) {
    return this.findAll({ state_id: stateId }, "name ASC");
  }
}

export class PlaceModel extends BaseModel {
  constructor() {
    super("places");
  }

  async getByCityId(cityId: number) {
    return this.findAll({ city_id: cityId }, "name ASC");
  }
}

export const State = new StateModel();
export const City = new CityModel();
export const Place = new PlaceModel();
