import {
  Component,
  OnInit,
  Input,
  ViewChild,
  Output,
  EventEmitter
} from "@angular/core";
import { Product, Pallier } from "../word";
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
  @Output() notifyProduction = new EventEmitter<{
    product: Product;
    upgrades: Pallier[];
  }>();

  @Output() notifyProductBuy: EventEmitter<number> = new EventEmitter<number>();

  @ViewChild("bar")
  progressBarItem;

  @ViewChild("barPallier")
  progressBarItemPallier;

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
  progress = 0.5;

  generatedMoney: number;
  progressbarPallier: any;
  progressPallier = 0.5;

  server: string;
  lastupdate: number;
  working = false;
  buyable: number;
  cost: number = 0;
  bonusVitesse: number = 1;
  upgrades: Pallier[] = []; //contient tous les upgrades débloqué pour le produit

  set prod(value: Product) {
    this.product = value;
  }

  constructor(private service: RestserviceService) {
    this.server = service.getServer();
  }

  ngOnInit() {
    this.progressbar = new ProgressBar.Line(
      this.progressBarItem.nativeElement,
      { strokeWidth: 50, color: "#00ffff" }
    );

    this.progressbarPallier = new ProgressBar.Line(
      this.progressBarItemPallier.nativeElement,
      { strokeWidth: 50, color: "#00ff00" }
    );

    setInterval(() => {
      this.calcScore();
      this.calcMaxCanBuy();
    }, 200);
  }
  startFabrication() {
    if (this.working == false && this.product.quantite > 0) {
      this.product.timeleft = this.product.vitesse / this.bonusVitesse;
      this.lastupdate = Date.now();
      this.progressbar.animate(1, { duration: this.product.timeleft });
      this.working = true;
      if (!this.product.managerUnlocked) {
        this.service.putProduct(this.product);
      }
    }
  }

  calcMaxCanBuy() {
    //calcul du nombre de produit qui peut être acheté
    let calc =
      Math.log(
        1 +
          (this.product.croissance * this.money - this.money) /
            this.product.cout
      ) / Math.log(this.product.croissance);
    let nb = Math.floor(calc); //arrondi au plus bas
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
    if (this.buyable < 0) {
      this.buyable = 0;
    }
    //une fois le nombre d'article que l'on peut acheté est calculer on calcul le coût de l'achat
    this.cost = this.calcCost();
    while (this.cost > this.money) {
      //fix : dans certain cas la forule donne un nombre d'article achetable trop grand, on reduit donc le nombre d'article achetable jusqu'à avoir un coût cohérant.
      this.buyable -= 1;
      this.cost = this.calcCost();
    }

    //Mise à jour de l'état du pallier
    this.calcPallierStep();

    //mise à jour de l'affichage
    this.calcGeneratedMoney();

    //mise à jour de la vitesse de création du produit en fonction des bonus
    this.calcBonusVitesse();
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
      this.notifyProduction.emit({
        product: this.product,
        upgrades: this.upgrades
      });
      this.working = false;
    } else {
      if (this.product.managerUnlocked) {
        this.startFabrication();
      }
    }
  }

  calcCost(): number {
    let { cout, croissance, quantite } = this.product;
    let totalQuantity = this.buyable + quantite;
    return (
      cout * ((1 - Math.pow(croissance, totalQuantity)) / (1 - croissance)) -
      cout * ((1 - Math.pow(croissance, quantite)) / (1 - croissance))
    );
  }

  calcGeneratedMoney(): number {
    if (this.product.quantite == 0) {
      this.generatedMoney = this.product.revenu;
      return;
    } else {
      let win = this.product.quantite * this.product.revenu;
      let finalWin = win;
      for (const pallier of this.product.palliers.pallier) {
        if (pallier.typeratio == "gain" && pallier.unlocked) {
          finalWin += win * (pallier.ratio - 1);
        }
      }
      for (const upgrade of this.upgrades) {
        if (upgrade.typeratio == "gain") {
          finalWin += win * (upgrade.ratio - 1);
        }
      }
      this.generatedMoney = finalWin;
      return;
    }
  }

  onBuy(quantity: number) {
    const { quantite } = this.product;
    const totalQuantity = quantity + quantite;
    const cost = this.calcCost();
    if (cost <= this.money) {
      this.product.quantite = totalQuantity;
      this.notifyProductBuy.emit(cost);
      this.calcPallierStep(); //setting if unlocked
      this.service.putProduct(this.product);
    }
    this.calcMaxCanBuy();
  }

  calcPallierStep() {
    if (this.progressbarPallier) {
      let buyed = this.product.quantite;
      for (const pallier of this.product.palliers.pallier) {
        if (!pallier.unlocked) {
          if (buyed >= pallier.seuil) {
            pallier.unlocked = true;
          } else {
            this.progressbarPallier.set(buyed / pallier.seuil);
            return;
          }
        }
      }
      this.progressbarPallier.set(1);
    }
  }

  public setUpgrade(palliers: Pallier[]) {
    let bonus: Pallier[] = [];
    for (const pallier of palliers) {
      if (pallier.idcible == this.product.id && pallier.unlocked) {
        bonus.push(pallier);
      }
    }
    this.upgrades = bonus;
  }

  public newWorldEvent() {
    setTimeout(() => {
      //lors de l'appel de la fonction le produit n'est pas encore mit à jours par angular : fix rapide pour retarder l'opération
      this.calcBonusVitesse();
      this.lastupdate = Date.now();
      if (this.product.timeleft > 0) {
        console.log(this.product.name);
        let total = this.product.vitesse / this.bonusVitesse;
        let start = (total - this.product.timeleft) / total;
        this.progressbar.set(start);
        this.progressbar.animate(1, {
          duration: this.product.timeleft
        });
        this.working = true;
      }
    }, 300);
  }

  calcBonusVitesse() {
    let bonusVitesse = 1;
    for (const pallier of this.product.palliers.pallier) {
      if (pallier.unlocked && pallier.typeratio == "vitesse") {
        bonusVitesse = bonusVitesse * pallier.ratio;
      }
    }
    for (const upgrade of this.upgrades) {
      if (upgrade.typeratio == "vitesse") {
        bonusVitesse = bonusVitesse * upgrade.ratio;
      }
    }
    this.bonusVitesse = bonusVitesse;
  }
}
