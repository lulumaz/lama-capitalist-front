import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { ProductComponent } from "./product/product.component";
import { HttpClientModule } from "@angular/common/http";
import { BigvaluePipe } from "./bigvalue.pipe";
import { ModalComponent } from './modal/modal.component';
import{ ToasterModule} from'angular2-toaster';

@NgModule({
  declarations: [AppComponent, ProductComponent, BigvaluePipe, ModalComponent],
  imports: [BrowserModule, HttpClientModule, FormsModule,ToasterModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
