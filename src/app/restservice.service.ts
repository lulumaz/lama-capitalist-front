import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { World, Pallier, Product } from './word';

@Injectable({
  providedIn: 'root'
})
export class RestserviceService {
  server = "http://192.168.43.137:8080/adventureisis/"
  user = "";

  constructor(private http: HttpClient) {

  }
  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error);
    return Promise.reject(error.message || error);
  }
  getWorld(): Promise<World> {
  return this.http.get(this.server + "generic/world").toPromise().catch(this.handleError);
  };
  
}
