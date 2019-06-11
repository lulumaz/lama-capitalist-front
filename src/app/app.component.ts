import { Component } from "@angular/core";
import { RestserviceService } from "./restservice.service";
import { World, Product, Pallier } from "./word";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "Lama Capitalist Project";
  auteurs = ["@Lucas Mazel", "@Kelig NOËL"];
  cryptolama = 2000000000;
  world: World = new World();
  server: string;

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
    service.getWorld().then(world => {
      this.world = world;
    });
  }

  onProductionDone(p: Product) {
    this.world.money += p.quantite * p.revenu;
    this.world.score += p.quantite * p.revenu;
  }
}
