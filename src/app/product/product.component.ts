import { Component, OnInit, Input, ViewChild } from '@angular/core';
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

  
  set prod(value: Product) {
    this.product = value;
  }
  

  constructor(private service: RestserviceService) { 
    this.server = service.getServer();
  }

  ngOnInit(){
    this.progressbar = new ProgressBar.Line(this.progressBarItem.nativeElement, { strokeWidth: 50, color:'#00ff00' });
    //setInterval(() => { this.calcScore(); }, 100);
    
  }
  startFabrication(){
    console.log("Je suis test1"+this.product)
    console.log("Je suis la vitesse :"+this.product.vitesse)

    this.progressbar.animate(1, { duration: this.product.vitesse });// complete the row 
  }

}
