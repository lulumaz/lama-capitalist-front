import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";

import { AppComponent } from "./app.component";
import { ProductComponent } from "./product/product.component";
import { HttpClientModule } from "@angular/common/http";
import { BigvaluePipe } from "./bigvalue.pipe";

@NgModule({
  declarations: [AppComponent, ProductComponent, BigvaluePipe],
  imports: [BrowserModule, HttpClientModule, FormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
