type DateFormat = "YYYY-MM-DD" | "MM/DD/YYYY" | "DD-MM-YYYY";

interface DateFormatterOptions {
  format: DateFormat;
  timezone?: string;
}

export class DateFormatter {
  private readonly format: DateFormat;
  private readonly timezone?: string;
  private readonly cache: Map<string, string>;

  constructor(options: DateFormatterOptions) {
    this.format = options.format;
    this.timezone = options.timezone;
    this.cache = new Map();
  }

  formatDate(date: Date | string): string {
    try {
      const dateKey = date instanceof Date ? date.toISOString() : date;
      const cached = this.cache.get(dateKey);
      if (cached) return cached;

      const d = date instanceof Date ? date : new Date(date);
      if (isNaN(d.getTime())) {
        throw new Error("Invalid date format");
      }

      const formatted = this.formatSingleDate(d);
      this.cache.set(dateKey, formatted);
      return formatted;
    } catch (error) {
      console.error("Date formatting error:", error);
      throw new Error(
        `Failed to format date: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  formatDateArray(dates: Array<Date | string>): string[] {
    return dates.map((date) => this.formatDate(date));
  }

  getCurrentFormattedDate(now = new Date()): string {
    return this.formatDate(now);
  }

  addDays(date: Date, days: number): Date {
    if (!Number.isInteger(days)) {
      throw new Error("Days must be an integer");
    }

    const MAX_DAYS = 365 * 100; // 100년 제한
    if (Math.abs(days) > MAX_DAYS) {
      throw new Error(`Days cannot exceed ${MAX_DAYS}`);
    }

    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private formatSingleDate(d: Date): string {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

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
  }
}
