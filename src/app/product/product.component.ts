import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter
} from "@angular/core";
import { Product } from "../word";
import { RestserviceService } from "../restservice.service";

declare var require;
const ProgressBar = require("progressbar.js");

@Component({
  selector: "app-product",
  templateUrl: "./product.component.html",
  styleUrls: ["./product.component.css"]
})
export class ProductComponent implements OnInit {
  @Output() notifyProduction: EventEmitter<Product> = new EventEmitter<
    Product
  >();

  @Output() notifyProductBuy: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild("bar")
  progressBarItem;

  @Input("prod")
  product: Product;

  @Input("money")
  money: number;

  _multSelected: string;
  @Input()
  set multSelected(value: string) {
    this._multSelected = value;
    if (this._multSelected && this.product) this.calcMaxCanBuy();
  }
  progressbar: any;
  server: string;
  progress = 0.5;
  lastupdate: number;
  working = false;
  buyable: number;

  set prod(value: Product) {
    this.product = value;
  }

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
  }

  ngOnInit() {
    this.progressbar = new ProgressBar.Line(
      this.progressBarItem.nativeElement,
      { strokeWidth: 50, color: "#00ff00" }
    );
    setInterval(() => {
      this.calcScore();
    }, 100);
  }
  startFabrication() {
    if (this.working == false) {
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.progressbar.animate(1, { duration: this.product.vitesse }); // complete the row
      this.working = true;
    }
  }

  calcMaxCanBuy() {
    //todo revoir la formule
    let calc = Math.floor(
      Math.log(
        1 +
          (this.product.croissance * this.money - this.money) /
            this.product.cout
      ) / Math.log(this.product.croissance)
    );
    if (this._multSelected != "Max") {
      let x = parseInt(this._multSelected);
      if (calc > x) {
        this.buyable = x;
      } else {
        this.buyable = calc;
      }
    } else {
      this.buyable = calc;
    }
  }

  calcScore() {
    if (this.product.timeleft > 0) {
      this.product.timeleft =
        this.product.timeleft - (Date.now() - this.lastupdate);
      this.lastupdate = Date.now();
    } else if (this.working) {
      this.progressbar.set(0);
      this.product.timeleft = 0;
      // on prévient le composant parent que ce produit a généré son revenu.
      this.notifyProduction.emit(this.product);
      this.working = false;
    }
  }

  onBuy(quantity: number) {
    let { cout, croissance, quantite } = this.product;
    let totalQuantity = quantity + quantite;
    let cost =
      cout * ((1 - Math.pow(croissance, totalQuantity)) / (1 - croissance));
    if (cost < this.money) {
      this.product.quantite = totalQuantity;
      this.notifyProductBuy.emit(cost);
    }
    this.calcMaxCanBuy();
  }
}
