type DateFormat = "YYYY-MM-DD" | "MM/DD/YYYY" | "DD-MM-YYYY";

export class DateFormatter {
  // 타입 정의 누락
  private format;

  constructor(format: DateFormat) {
    this.format = format;
  }

  // any 타입 사용
  formatDate(date: any): string {
    try {
      // Date 객체가 아닌 경우 처리 누락
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      // 중복된 코드
      switch (this.format) {
        case "YYYY-MM-DD":
          return `${year}-${month}-${day}`;
        case "MM/DD/YYYY":
          return `${month}/${day}/${year}`;
        case "DD-MM-YYYY":
          return `${day}-${month}-${year}`;
        default:
          return `${year}-${month}-${day}`;
      }
    } catch (error) {
      // 에러 처리 미흡
      return "";
    }
  }

  // 중복된 로직
  formatDateArray(dates: Date[]): string[] {
    return dates.map((date) => {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const day = d.getDate();

      switch (this.format) {
        case "YYYY-MM-DD":
          return `${year}-${month}-${day}`;
        case "MM/DD/YYYY":
          return `${month}/${day}/${year}`;
        case "DD-MM-YYYY":
          return `${day}-${month}-${year}`;
        default:
          return `${year}-${month}-${day}`;
      }
    });
  }

  // 테스트하기 어려운 현재 시간 처리
  getCurrentFormattedDate(): string {
    const now = new Date();
    return this.formatDate(now);
  }

  // 매직 넘버 사용
  addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}
