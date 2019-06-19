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
//var randomColor = Math.floor(Math.random()*16777215).toString(16);

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
      this.calcMaxCanBuy();
    }, 100);
  }
  startFabrication() {
    if (this.working == false && this.product.quantite>0) {
      this.product.timeleft = this.product.vitesse;
      this.lastupdate = Date.now();
      this.progressbar.animate(1, { duration: this.product.vitesse }); // complete the row
      this.working = true;
      if (!this.product.managerUnlocked) {
        this.service.putProduct(this.product);
      }
    }
  }

  calcMaxCanBuy() {
    //todo revoir la formule
    let calc = Math.floor(
      Math.log(
        1 +
         ( (this.product.croissance * this.money - this.money) /
            this.product.cout )
      ) / Math.log(this.product.croissance)
    );
    let nb = Math.trunc(calc);
    if (this._multSelected != "Max") {
      let x = parseInt(this._multSelected);
      if (nb > x) {
        this.buyable = x;
      } else {
        this.buyable = nb;
      }
    } else {
      this.buyable = nb;
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
    } else {
      if (this.product.managerUnlocked) {
        this.startFabrication();
      }
    }
  }

  onBuy(quantity: number) {
    let { cout, croissance, quantite } = this.product;
    let totalQuantity = quantity + quantite;
    let cost =
      cout * ((1 - Math.pow(croissance, quantity)) / (1 - croissance));
    if (cost <= this.money) {
      this.product.quantite = totalQuantity;
      this.notifyProductBuy.emit(cost);
      this.service.putProduct(this.product);
    }
    this.calcMaxCanBuy();
  }
}
