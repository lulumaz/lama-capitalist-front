import { Component } from "@angular/core";
import { RestserviceService } from "./restservice.service";
import { World, Product, Pallier } from "./word";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Lama Capitalist";
  auteurs = ["@Lucas Mazel", "@Kelig NOËL"];
  cryptolama = 2000000000;
  world: World = new World();
  server: string;
  mult: string[] = ["1", "10", "100", "Max"];
  multSelected: string = this.mult[0];
  username: string = "";

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(world => {
      this.world = world;
      console.log(world);
    });
  }

  onProductionDone(p: Product) {
    this.world.money += p.quantite * p.revenu;
    this.world.score += p.quantite * p.revenu;
  }

  onMultChange(actualMult: string) {
    let i = this.mult.indexOf(actualMult);
    if (i < this.mult.length - 1) {
      this.multSelected = this.mult[i + 1];
    } else {
      this.multSelected = this.mult[0];
    }
  }

  onProductBuy(cost: number) {
    this.world.money = this.world.money - cost;
  }
  onUsernameChanged(username: string) {
    this.service.setUser(username);
    this.service.getWorld().then(world => {
      this.world = world;
    });
  }

  onBuyManager(manager: Pallier) {
    if (manager.seuil <= this.world.money) {
      manager.unlocked = true;
      this.service.putManager(manager);
      this.world.money -= manager.seuil;
      this.world.products.product[manager.idcible].managerUnlocked = true;
    }
  }
}
