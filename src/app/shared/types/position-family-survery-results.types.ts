export interface PositionDescriptionResults{
    id : number;
    description : string;
    surveyTips: SurveyTipsInfo[];
}

export interface PositionFamilySurveyResults{
    recordId : string;
    jobFamily_Short : string;
    jobFamily_Long : string;
    title: string;
    positionDescription: string;
    monetoryUnit: string
    monetoryISO: string;
    numExp: number;
    numOrg: number;
    remCals: RemCalculationInfo[];
    levels: PositionFamilyLevelInfo[];
    surveyTips: SurveyTipsInfo[]
}

export interface PositionFamilyLevelInfo{
    level: string;
    jobLevellingId : number;
    typicalTitle: string;
    results: SurveyResultSet[];
}

export interface RemCalculationInfo{
    label: string;
    calcType : number;
    value: number;
    orderNumber: number;
}

export interface SurveyResultSet{
    name: string;
    elemType: ElementType;
    values: string[];
    valueInfos: SurveyResultSetValueInfo[];
}

export class SurveyResultDataElement{
    id : number;
    name: string;
    constructor(id : number, name: string){
        this.id = id;
        this.name = name
    }
}

export class SurveyResultSetValueInfo{
    label : string;
    value: string;
    orderNumber : number;
    groupOrderNumber : number;
    constructor(){

    }
}

export enum CalcType {
    Average = "Average",
    Percentile = "Percentile",
    Count = "Count",
    CompanyCount = "CompanyCount"
}

export enum ElementType{
    Number = 1,
    Percentage =2,
    IncentiveMix = 3,
    SimpleAverage = 10,
    Percentile = 11,
    General = 20,
    FilteredPercentile = 25,
    CostBenefitFactor1 = 26,
    CostBenefitFactor2 = 27,
    CostBenefitFactor3 = 28,
}

export interface SurveyTipsInfo{
    id: number;
    tipText : string;
    displayOrder: number;
}

