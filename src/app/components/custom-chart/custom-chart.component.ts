import {
  Component,
  ElementRef,
  ChangeDetectorRef,
  ViewChild,
  AfterViewInit,
  OnInit
} from '@angular/core';
import { HighchartsService } from '../../services/highcharts.service';
import * as Highcharts from 'highcharts';
import { Options } from 'highcharts';
import mockData from '../../../data/response.json';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { PositionFamilySurveyResults, RemCalculationInfo, CalcType } from '../../shared/types';


@Component({
  selector: 'app-custom-chart',
  templateUrl: './custom-chart.component.html',
  styleUrls: ['./custom-chart.component.css']
})
export class CustomChartComponent implements OnInit, AfterViewInit {

  @ViewChild('charts', { static: true }) public chartElement: ElementRef;

  surveyResults: any;
  selectedDataElementName: string =
    "Total Allowances Amount:  Reporting Employees";
  percentileList: RemCalculationInfo[];
  dataAvailable: Boolean = true;
  chartLevelInfoList: [];
  companyCountOrderNumber: number = 1;
  employeeCountOrderNumber: number = 2;
  isAverageDisplay = false;
  seriesColorPalette = ["#88D6F7", "#4BBBEC", "#0D94BB", "#006E91", "#264A5C", "#800080"];
  symbolList = ["triangle", "square", "circle", "diamond", "triangle-down", "circle"];
  numberOfMonths = "NUMBER OF MONTHS";
  salaryStructure = "SALARY STRUCTURE MIDPOINT";
  filteredPercentile = "FILTEREDPERCENTILE";
  percentage = "PERCENTAGE";
  maxPercentileCount = 6;
  minValue = null;
  maxValue = null;
  private destroy$: Subject<boolean> = new Subject<boolean>();

  public config: any = {
    chart: {
      type: "scatter",
      events: {
        load: (e) => {
            const axis = e.target.xAxis[0];
            const ticks = axis.ticks;
            const points = e.target.series[0].points;
            points.forEach((point, i) => {
                if (ticks[i]) {
                    const label = ticks[i].label.element;
                    label.id = i;
                    label.onclick = ev => {
                        ev.preventDefault();
                        this.showChartTooltip(ev);
                    }
                }
            });
        }
    }
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
        useHTML: true,
        formatter: value => {
          return this.getFormatter(value);
        }
      }
    },
    yAxis: {
      min: 0,
      max: 100000,
      lineWidth: 1,
      labels: {
        useHTML: true,
        style: {
          fontSize: '12px',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontWeight: '700',
          color: '#999999'
        }
      },
      title: {
        text: ''
      },
      gridLinesColor: '#D8D8D8',
      gridLineWidth: 2
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
        type: 'line',
        data: [1, 2, 3],
        dataLabels: {
          enabled: true
        },
        pointWidth: 40
      },
      {
        name: "Line 2",
        type: 'line',
        data: [5, 6, 2]
      },
      {
        name: "Line 3",
        type: 'line',
        data: [4, 5, 7]
      }
    ]
  };

  public options: any = {
    chart: {
      type: 'scatter',
      height: 500,
      width: 1100,
    },
    title: {
      text: 'Scatter Chart'
    },
    xAxis: {
      categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas']
    },
    yAxis: {
      min: 0,
      title: {
        text: 'Total fruit consumption'
      }
    },
    legend: {
      reversed: true
    },
    plotOptions: {
      series: {
        stacking: 'normal'
      }
    },
    series: [{
      name: 'John',
      data: [5, 3, 4, 7, 2]
    }, {
      name: 'Jane',
      data: [2, 2, 3, 2, 1]
    }, {
      name: 'Joe',
      data: [3, 4, 4, 2, 5]
    }]
  }


  constructor(private hcs: HighchartsService, private changeDetectionRef: ChangeDetectorRef) {
    this.surveyResults = mockData;
  }

  ngOnInit() {
    this.minValue = null;
    this.maxValue = null;
    this.getPercentileList();
    this.checkDataAvailable();
    this.getChartData();
    this.getXAxisLegend();
    debugger;
    if (this.dataAvailable) {
      Highcharts.chart('container', this.config);
    }
  }

  ngOnDestroy() {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  checkDataAvailable() {
    this.dataAvailable = true;
    this.surveyResults.levels.forEach((level) => {
      const elementResult = level.results.filter(item => { return item.Name === this.selectedDataElementName; });
      if (elementResult !== null && elementResult !== undefined && elementResult.length > 0) {
        const employeeCount = elementResult[0].Values.find(function (v) { return v.label === "Emps."; });
        if (employeeCount && employeeCount.value.length > 0) {
          this.dataAvailable = true;
        }
      }
    });
  }

  getChartData() {
    if (!this.selectedDataElementName) return;
    this.config.series[0].data = [];
    this.surveyResults.levels.forEach((resultItem, levelIndex) => {
      const rangePoint = { x: levelIndex, low: null, high: null };

      const elementResult = resultItem.results.filter(item => {
        return item.Name === this.selectedDataElementName;
      });
      const percentileValueList = [];
      if (elementResult) {
        elementResult[0].Values.forEach((item, index) => {
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
        percentileItem.CalcType === CalcType.Percentile ||
        percentileItem.CalcType === CalcType.Average
      ) {
        this.percentileList.push(percentileItem);
      }
      if (percentileItem.Label === "Cos.")
        this.companyCountOrderNumber = percentileIndex;
      if (percentileItem.Label === "Emps.")
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
          percentile.Label === "Avg."
            ? "Average"
            : percentile.label + " percentile",
        data: [],
        visible:
          percentile.Label === "Avg." && percentileIndex === 0
            ? true
            : percentile.Label === "Avg."
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
          radius: percentile.Label === "Avg." ? 7 : 6
        },
        zIndex: percentile.Label === "Avg." ? 1 : 10
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
          elementResult[0].Values[this.employeeCountOrderNumber]; //.value;
        obj.companyCount =
          elementResult[0].Values[this.companyCountOrderNumber]; //.value;
      }
      this.chartLevelInfoList.push(obj);
    });
  }
  getFormatter(t) {
    if (this.surveyResults.remCalcs && this.surveyResults.remCalcs[t.value]) {
      return (
        "<a href='#' class='chart-axis-label chart-label'>Level " +
        this.surveyResults.remCalcs[t.value].level +
        "<br/><b>" +
        this.surveyResults.remCalcs[t.value].typicalTitle.toUpperCase() +
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
      /*
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
        */
    }
  }

  ngAfterViewInit() {
    //this.createChart();
  }
  createChart(length: Number = 3) {
    for (let i = 0; i < length; i++) {
      this.hcs.createChart(this.chartElement.nativeElement, this.options);
    }
  }
}