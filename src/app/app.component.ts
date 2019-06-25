import { Component, ViewChildren, QueryList } from "@angular/core";
import { RestserviceService } from "./restservice.service";
import { World, Product, Pallier } from "./word";
import { ProductComponent } from "./product/product.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  world: World = new World();
  server: string;
  mult: string[] = ["1", "10", "100", "Max"];
  multSelected: string = this.mult[0];
  username: string = "";
  @ViewChildren(ProductComponent) productsComponent: QueryList<
    ProductComponent
  >;

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(world => {
      this.world = world;
      this.productsComponent.forEach(p =>
        p.setUpgrade(this.world.upgrades.pallier)
      );
      this.productsComponent.forEach(p => p.newWorldEvent());
    });
  }

  onProductionDone(value: { product: Product; upgrades: Pallier[] }) {
    let { product, upgrades } = value;
    let win = product.quantite * product.revenu;
    let finalWin = win;
    for (const pallier of product.palliers.pallier) {
      if (pallier.typeratio == "gain" && pallier.unlocked) {
        finalWin += win * (pallier.ratio - 1);
      }
    }
    for (const upgrade of upgrades) {
      if (upgrade.typeratio == "gain") {
        finalWin += win * (upgrade.ratio - 1);
      }
    }
    this.world.money += finalWin;
    this.world.score += finalWin;
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
      this.productsComponent.forEach(p =>
        p.setUpgrade(this.world.upgrades.pallier)
      );
      this.productsComponent.forEach(p => p.newWorldEvent());
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

  onBuyUpgrade(upgrade: Pallier) {
    if (upgrade.seuil <= this.world.money) {
      this.world.money -= upgrade.seuil;
      upgrade.unlocked = true;
      this.productsComponent.forEach(p =>
        p.setUpgrade(this.world.upgrades.pallier)
      );
      this.service.putUpgrade(upgrade);
    }
  }
}
