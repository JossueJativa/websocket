interface ITime {
    hours: number;
    minutes: number;
    seconds: number;
}

interface IDate {
    day: number;
    month: number;
    year: number;
}

interface IDateTime {
    time: ITime;
    date: IDate;
}

export { ITime, IDate, IDateTime };