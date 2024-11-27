import moment from "moment";

export type DateRange = [moment.Moment, moment.Moment];

export const startOfYear = (y1: number) => moment().year(y1).startOf("year");

export const endOfYear = (y2: number) => moment().year(y2).endOf("year");

// Meh, that's all the years we'll need for now
export const ALL_YEARS = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022];

export const MAX_DATE_RANGE: DateRange = [
  startOfYear(ALL_YEARS[0]),
  endOfYear(ALL_YEARS[ALL_YEARS.length - 1]),
];

export const isInRange = (
  date: moment.Moment,
  dateRange: [moment.Moment, moment.Moment],
) => {
  return date.isBetween(dateRange[0], dateRange[1], "day", "[]");
};
