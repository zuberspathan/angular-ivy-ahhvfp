import { Component } from "@angular/core";
import { Chart } from "angular-highcharts";
import * as Highcharts from "highcharts";
import { Options } from "highcharts";
import * as data from "../data/response.json";

@Component({
  selector: "my-app",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  /*name = "Angular";

  chart: Chart;
  config: Options;
  selectedDataElementName: string =
    "Total Allowances Amount:  Reporting Employees";
    percentileList : [];
  dataAvailable: Boolean = true;
  surveyResults: any;
  chartLevelInfoList: [];
  companyCountOrderNumber: number = 1;
  employeeCountOrderNumber: number = 2;

  constructor() {
    this.surveyResults = data;
  }

  ngOnChanges() {
    this.getXAxisLegend();
  }
  ngOnInit() {
    this.init();
    this.getXAxisLegend();
    this.getChartData();
  }

  init() {
    this.config = {
      chart: {
        type: "scatter"
      },
      legend: {
        enabled: true,
        verticalAlign: "bottom",
        layout: "horizontal",
        itemStyle: {
          fontSize: "12px",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontWeight: "700",
          color: "#666666"
        }
      },
      plotOptions: {
        series: {
          dataLabels: {
            enabled: false,
            padding: 10,
            align: "left",
            verticalAlign: "middle",
            color: "#000000",
            allowOverlap: true,
            style: {
              "text-align": "right",
              fontFamily: "Arial, Helvetica, sans-serif",
              fontWeight: "700",
              fontSize: "12px",
              lineHeight: "auto"
            },
            x: 20
          },
          marker: {
            radius: 6
          }
        }
      },
      xAxis: {
        type: "category",
        categories: [],
        labels: {
          useHTML: true
          // formatter: value => {
          //   return this.getFormatter(value);
          // }
        }
      },
      title: {
        text: "Scatter Chart"
      },
      credits: {
        enabled: true
      },
      series: [
        {
          name: "Line 1",
          enableMouseTracking: false,
          showInLegend: true,
          animation: true,
          borderWidth: 2,
          borderColor: "#666666",
          color: "#FFF",
          data: [1, 2, 3],
          dataLabels: {
            enabled: true
          },
          pointWidth: 40
        },
        {
          name: "Line 2",
          data: [5, 6, 2]
        },
        {
          name: "Line 3",
          data: [4, 5, 7]
        }
      ]
    };
    this.chart = new Chart(this.config);
    //Highcharts.chart('container', this.config);
  }
  getChartData() {
    if (!this.selectedDataElementName) return;
    this.config.series[0].data = [];
    this.surveyResults.levels.forEach((resultItem, levelIndex) => {
      const rangePoint = { x: levelIndex, low: null, high: null };

      const elementResult = resultItem.results.filter(item => {
        return item.name === this.selectedDataElementName;
      });
      const percentileValueList = [];
      if (elementResult) {
        elementResult[0].valueInfos.forEach((item, index) => {
          if (
            this.percentileList.filter(percentileItem => {
              return percentileItem.orderNumber === index;
            }).length > 0 &&
            Number(item.value) > 0
          ) {
            percentileValueList.push(item.value);
          }
        });
      }

      rangePoint.low = Math.min.apply(Math, percentileValueList);
      rangePoint.high = Math.max.apply(Math, percentileValueList);

      this.config.series[0].data.push(rangePoint);
    });
  }

  getPercentileList() {
    this.percentileList = [];
    this.surveyResults.remCalcs.forEach((percentileItem, percentileIndex) => {
      percentileItem.orderNumber = percentileIndex;
      if (
        percentileItem.calcType === CalcType.Percentile ||
        percentileItem.calcType === CalcType.Average
      ) {
        this.percentileList.push(percentileItem);
      }
      if (percentileItem.label === "Cos.")
        this.companyCountOrderNumber = percentileIndex;
      if (percentileItem.label === "Emps.")
        this.employeeCountOrderNumber = percentileIndex;
    });

    if (this.percentileList.length > 6)
      this.percentileList = this.percentileList.slice(
        0,
        this.maxPercentileCount
      );

    this.config.series.length = 1;
    this.percentileList.forEach((percentile, percentileIndex) => {
      const seriesTemplate = {
        name:
          percentile.label === "Avg."
            ? "Average"
            : percentile.label + " percentile",
        data: [],
        visible:
          percentile.label === "Avg." && percentileIndex === 0
            ? true
            : percentile.label === "Avg."
            ? this.isAverageDisplay
            : true,
        type: "scatter",
        color:
          percentileIndex < this.percentileList.length - 1
            ? this.seriesColorPalette[percentileIndex]
            : this.seriesColorPalette[this.seriesColorPalette.length - 1],
        marker: {
          symbol:
            percentileIndex < this.percentileList.length - 1
              ? this.symbolList[percentileIndex]
              : this.symbolList[this.symbolList.length - 1],
          radius: percentile.label === "Avg." ? 7 : 6
        },
        zIndex: percentile.label === "Avg." ? 1 : 10
      };
      
      this.config.series.push(seriesTemplate);

      this.surveyResults.levels.forEach((resultItem, levelIndex) => {
        const point = {
          x: levelIndex,
          y: null,
          employeeCount: 0,
          companyCount: 0,
          dataLabels: {}
        };

        const elementResult = resultItem.results.filter(item => {
          return item.name === this.selectedDataElementName;
        });
        if (elementResult !== null && elementResult.length > 0) {
          if (
            elementResult[0].elemType.toString().toUpperCase() ===
              this.percentage ||
            elementResult[0].elemType.toString().toUpperCase() ===
              this.filteredPercentile ||
            elementResult[0].name.toString().toUpperCase() ===
              this.numberOfMonths ||
            elementResult[0].name.toString().toUpperCase() ===
              this.salaryStructure
          ) {
            this.isAverageDisplay = true;
          } else this.isAverageDisplay = false;

          const percentileValue =
            elementResult[0].valueInfos[percentile.orderNumber].value;
          if (percentileValue !== "" && percentileValue) {
            point.y = Number(percentileValue) * 1;

            point.employeeCount = Number(
              elementResult[0].valueInfos[this.employeeCountOrderNumber].value
            );
            point.companyCount = Number(
              elementResult[0].valueInfos[this.companyCountOrderNumber].value
            );
          }
        }

        if (percentileIndex === 0) {
          point.dataLabels = { enabled: true, y: 3 };
        } else if (percentile.value === 50) {
          point.dataLabels = { enabled: true };
        }

        if (this.isAverageDisplay === true) {
          if (percentileIndex === this.percentileList.length - 1) {
            point.dataLabels = { enabled: true };
          }
        } else {
          if (percentileIndex === this.percentileList.length - 2) {
            point.dataLabels = { enabled: true };
          }
        }

        if (point.y !== null)
          this.config.series[percentileIndex + 1].data.push(point);

        if (this.minValue === null) {
          this.minValue = point.y;
          this.maxValue = point.y;
        } else {
          this.maxValue = Math.max(this.maxValue, point.y);
          this.minValue = Math.min(this.minValue, point.y);
        }

        this.config.yAxis.min = this.minValue * 0.9;
        this.config.yAxis.max = this.maxValue * 1.1;
      });
    });
  }

  getXAxisLegend() {
    if (!this.selectedDataElementName) return;

    this.chartLevelInfoList = [];
    this.surveyResults.levels.forEach(level => {
      const obj = {
        level: level.Level,
        typicalTitle: level.TypicalTitle,
        jobLevellingId: level.JobLevellingId,
        employeeCount: null,
        companyCount: null
      };
      const elementResult = level.results.filter(item => {
        return item.Name == this.selectedDataElementName;
      });
      if (elementResult && elementResult.length > 0) {
        obj.employeeCount =
          elementResult[0].Values[this.employeeCountOrderNumber].value;
        obj.companyCount =
          elementResult[0].Values[this.companyCountOrderNumber].value;
      }
      this.chartLevelInfoList.push(obj);
    });
  }
  getFormatter(t) {
    if (this.surveyResults.RemCalcs && this.surveyResults.RemCalcs[t.value]) {
      return (
        "<a href='#' class='chart-axis-label chart-label'>Level " +
        this.surveyResults.RemCalcs[t.value].level +
        "<br/><b>" +
        this.surveyResults.RemCalcs[t.value].typicalTitle.toUpperCase() +
        "</b></a>"
      );
    } else {
      return "";
    }
  }
  showChartTooltip(e) {
    const id = e.currentTarget.id;
    if (this.chartLevelInfoList && this.chartLevelInfoList[id]) {
      const levelId = this.chartLevelInfoList[id].jobLevellingId;
      if (levelId <= 0) return;

      const companyCount = this.chartLevelInfoList[id].companyCount;
      const employeeCount = this.chartLevelInfoList[id].employeeCount;
      this.dataService
        .getJobLevelingInfo(levelId)
        .pipe(takeUntil(this.destroy$))
        .subscribe(info => {
          const modalReference = this.modalService.open(
            ModalJobLevellingInfoComponent,
            { centered: true, backdrop: "static", windowClass: "md-modal" }
          );
          modalReference.componentInstance.info = info;
          modalReference.componentInstance.companyCount = Number(companyCount);
          modalReference.componentInstance.employeeCount = Number(
            employeeCount
          );
        });
    }
  }*/
}
