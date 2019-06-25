import { Component, ViewChildren, QueryList } from "@angular/core";
import { RestserviceService } from "./restservice.service";
import { World, Product, Pallier } from "./word";
import { ProductComponent } from "./product/product.component";
import { ToasterService } from "angular2-toaster";
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
  hasNewManager: boolean = false;
  hasNewUpgrade: boolean = false;
  @ViewChildren(ProductComponent) productsComponent: QueryList<
    ProductComponent
  >;

  constructor(
    private service: RestserviceService,
    private toasterService: ToasterService
  ) {
    this.server = service.getServer();
    service.getWorld().then(world => {
      this.world = world;
      this.productsComponent.forEach(p =>
        p.setUpgrade(this.world.upgrades.pallier)
      );
      this.productsComponent.forEach(p => p.newWorldEvent());
      this.calcNewManager();
      this.calcNewUpgrade();
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
    this.calcNewManager();
    this.calcNewUpgrade();
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
    this.calcNewManager();
    this.calcNewUpgrade();
  }
  onUsernameChanged(username: string) {
    this.service.setUser(username);
    this.service.getWorld().then(world => {
      this.world = world;
      this.productsComponent.forEach(p =>
        p.setUpgrade(this.world.upgrades.pallier)
      );
      this.productsComponent.forEach(p => p.newWorldEvent());
      this.calcNewManager();
      this.calcNewUpgrade();
    });
  }

  onBuyManager(manager: Pallier) {
    if (manager.seuil <= this.world.money) {
      manager.unlocked = true;
      this.service.putManager(manager);
      this.world.money -= manager.seuil;
      this.world.products.product[manager.idcible].managerUnlocked = true;
      this.toasterService.pop("success", "Manager hired ! ", manager.name);
      this.calcNewManager();
      this.calcNewUpgrade();
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
      this.calcNewManager();
      this.calcNewUpgrade();
    }
  }
  //permet de détecter la disponibilité d'un nouveau manager
  calcNewManager() {
    let test = false;
    for (const manager of this.world.managers.pallier) {
      if (!manager.unlocked && manager.seuil <= this.world.money) {
        test = true;
        break;
      }
    }
    this.hasNewManager = test;
  }
  //permet de détecter la disponibilité d'un nouveau upgrade
  calcNewUpgrade() {
    let test = false;
    for (const upgrade of this.world.upgrades.pallier) {
      if (!upgrade.unlocked && upgrade.seuil <= this.world.money) {
        test = true;
        break;
      }
    }
    this.hasNewUpgrade = test;
  }
}
