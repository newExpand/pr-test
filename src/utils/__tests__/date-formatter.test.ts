import { describe, it, expect, beforeEach } from "vitest";
import { DateFormatter } from "../date-formatter";

describe("DateFormatter", () => {
  let formatter: DateFormatter;

  beforeEach(() => {
    formatter = new DateFormatter({ format: "YYYY-MM-DD" });
  });

  describe("formatDate", () => {
    it("올바른 날짜 문자열을 포맷팅해야 함", () => {
      const result = formatter.formatDate("2024-03-15");
      expect(result).toBe("2024-03-15");
    });

    it("Date 객체를 포맷팅해야 함", () => {
      const date = new Date("2024-03-15");
      const result = formatter.formatDate(date);
      expect(result).toBe("2024-03-15");
    });

    it("다른 포맷으로 날짜를 포맷팅해야 함", () => {
      const mmddFormatter = new DateFormatter({ format: "MM/DD/YYYY" });
      const result = mmddFormatter.formatDate("2024-03-15");
      expect(result).toBe("03/15/2024");
    });

    it("잘못된 날짜 형식에 대해 에러를 발생시켜야 함", () => {
      expect(() => formatter.formatDate("invalid-date")).toThrow(
        "Failed to format date",
      );
    });

    it("캐시된 결과를 반환해야 함", () => {
      const date = "2024-03-15";
      const first = formatter.formatDate(date);
      const second = formatter.formatDate(date);
      expect(first).toBe(second);
    });
  });

  describe("formatDateArray", () => {
    it("날짜 배열을 포맷팅해야 함", () => {
      const dates = ["2024-03-15", "2024-03-16"];
      const results = formatter.formatDateArray(dates);
      expect(results).toEqual(["2024-03-15", "2024-03-16"]);
    });

    it("빈 배열에 대해 빈 배열을 반환해야 함", () => {
      const results = formatter.formatDateArray([]);
      expect(results).toEqual([]);
    });
  });

  describe("getCurrentFormattedDate", () => {
    it("현재 날짜를 포맷팅해야 함", () => {
      const mockDate = new Date("2024-03-15");
      const result = formatter.getCurrentFormattedDate(mockDate);
      expect(result).toBe("2024-03-15");
    });
  });

  describe("addDays", () => {
    it("날짜에 일수를 더해야 함", () => {
      const date = new Date("2024-03-15");
      const result = formatter.addDays(date, 5);
      expect(formatter.formatDate(result)).toBe("2024-03-20");
    });

    it("음수 일수를 처리해야 함", () => {
      const date = new Date("2024-03-15");
      const result = formatter.addDays(date, -5);
      expect(formatter.formatDate(result)).toBe("2024-03-10");
    });

    it("소수점 일수에 대해 에러를 발생시켜야 함", () => {
      const date = new Date("2024-03-15");
      expect(() => formatter.addDays(date, 1.5)).toThrow(
        "Days must be an integer",
      );
    });

    it("최대 일수 제한을 초과하면 에러를 발생시켜야 함", () => {
      const date = new Date("2024-03-15");
      expect(() => formatter.addDays(date, 365 * 101)).toThrow(
        "Days cannot exceed",
      );
    });
  });
});
