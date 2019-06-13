import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { World, Pallier, Product } from "./word";

@Injectable({
  providedIn: "root"
})
export class RestserviceService {
  server = "http://localhost:8080/";
  adeventureisis = "adventureisis/";
  user = "";

  constructor(private http: HttpClient) {}
  private handleError(error: any): Promise<any> {
    console.error("An error occurred", error);
    return Promise.reject(error.message || error);
  }

  public getWorld(): Promise<World> {
    return this.http
      .get(this.server + this.adeventureisis + "generic/world")
      .toPromise()
      .catch(this.handleError);
  }

  public getServer() {
    return this.server;
  }
}
