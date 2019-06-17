import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { World, Pallier, Product } from "./word";

@Injectable({
  providedIn: "root"
})
export class RestserviceService {
  server = "http://192.168.1.32:8080/";
  adeventureisis = "adventureisis/";
  user = "keligClone4";

  constructor(private http: HttpClient) {}
  private handleError(error: any): Promise<any> {
    console.error("An error occurred", error);
    return Promise.reject(error.message || error);
  }

  setUser(username: string) {
    this.user = username;
  }

  private setHeaders(
    user: string
  ): {
    [header: string]: string | string[];
  } {
    return { "X-User": user };
  }

  public getWorld(): Promise<World> {
    return this.http
      .get(this.server + this.adeventureisis + "generic/world", {
        headers: this.setHeaders(this.user)
      })
      .toPromise()
      .catch(this.handleError);
  }

  public getServer() {
    return this.server;
  }
  public putManager(manager: Pallier): Promise<any> {
    return this.http
      .put(this.server + this.adeventureisis + "generic/manager", manager, {
        headers: this.setHeaders(this.user)
      })
      .toPromise();
  }

  public putProduct(product: Product): Promise<any> {
    return this.http
      .put(this.server + this.adeventureisis + "generic/product", product, {
        headers: this.setHeaders(this.user)
      })
      .toPromise();
  }
}
