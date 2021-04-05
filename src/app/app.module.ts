import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { FormsModule } from "@angular/forms";
import { ChartModule } from "angular-highcharts";

import { AppComponent } from "./app.component";
import { CustomChartComponent } from "./components/custom-chart/custom-chart.component";
import { ChartComponent } from "./shared/components/chart/chart.component";
import { HighchartsService } from "./services/highcharts.service";

@NgModule({
  imports: [BrowserModule, FormsModule, ChartModule],
  declarations: [
    AppComponent,
    CustomChartComponent,
    ChartComponent
  ],
  bootstrap: [AppComponent],
  providers:[HighchartsService]
})
export class AppModule {}
