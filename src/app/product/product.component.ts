import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { Product } from '../word';
import { RestserviceService } from '../restservice.service';

declare var require;
const ProgressBar = require("progressbar.js");

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})

export class ProductComponent implements OnInit {
  @ViewChild('bar')
  progressBarItem;

  @Input('prod')  
  product: Product;
  progressbar: any;
  server:string;
  progress =0.5;
  lastupdate:number;
  @Output() 
  notifyProduction: EventEmitter<Product> = new EventEmitter <Product>();
  
 

  set prod(value: Product) {
    this.product = value;
  }
  
  constructor(private service: RestserviceService) { 
    this.server = service.getServer();
  }

  ngOnInit(){
    this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, { strokeWidth: 50, color:'#00ff00' });
    setInterval(() => { this.calcScore(); }, 100);
    
  }
  startFabrication(){
    this.progressbar.animate(1, { duration: this.product.vitesse });// complete the row 
  }

  calcScore(){
    console.log("Je suis la foncion")
    if (this.product.timeleft== 0) {
    }
    else if(this.product.timeleft==1) {
      this.product.timeleft=this.product.timeleft-(Date.now()-this.lastupdate)
      this.lastupdate=Date.now();

      // on prévient le composant parent que ce produit a généré sonrevenu.
      this.notifyProduction.emit(this.product);

    }
    else{
      this.progressbar.set(0);
    }
  }

}
