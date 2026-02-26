export class DateConverter {
  static FromISO8601(date: string) {
    const [year, month, day] = date.split('-');
    const checkInDate = new Date(Number(year), Number(month) - 1, Number(day));
    return checkInDate;
  }
}
