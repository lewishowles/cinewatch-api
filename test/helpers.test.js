import { describe, expect, test } from "vitest";
import { getSearchData, parseUrlParams, getDatesFromDays } from "../src/helpers.js";

describe("helpers", () => {
	describe("getSearchData", () => {
		describe("A non-string URL throws an error", () => {
			test.for([
				["boolean (true)", true],
				["boolean (false)", false],
				["number (positive)", 1],
				["number (negative)", -1],
				["number (NaN)", NaN],
				["string (empty)", ""],
				["object (non-empty)", { property: "value" }],
				["object (empty)", {}],
				["array (non-empty)", [1, 2, 3]],
				["array (empty)", []],
				["null", null],
				["undefined", undefined],
			])("%s", ([, input]) => {
				expect(() => getSearchData(input)).toThrow();
			});
		});

		test("Returns the base URL with date parameter", () => {
			const url = "https://www.cineworld.co.uk/cinemas/ashton-under-lyne/068#/buy-tickets-by-cinema?in-cinema=068&at=2026-01-09&view-mode=list";

			expect(getSearchData(url)).toEqual({
				baseUrl: "https://www.cineworld.co.uk/cinemas/ashton-under-lyne/068",
				fullUrl: "https://www.cineworld.co.uk/cinemas/ashton-under-lyne/068#?at=2026-01-09",
				selectedDate: "2026-01-09",
			});
		});

		test("Returns the base URL if no date parameter is found", () => {
			const url = "https://www.cineworld.co.uk/cinemas/ashton-under-lyne/068#/buy-tickets-by-cinema?in-cinema=068&view-mode=list";

			expect(getSearchData(url)).toEqual({
				baseUrl: "https://www.cineworld.co.uk/cinemas/ashton-under-lyne/068",
				fullUrl: "https://www.cineworld.co.uk/cinemas/ashton-under-lyne/068",
				selectedDate: null,
			});
		});
	});

	describe("parseUrlParams", () => {
		describe("A non-string URL returns an empty object", () => {
			test.for([
				["boolean (true)", true],
				["boolean (false)", false],
				["number (positive)", 1],
				["number (negative)", -1],
				["number (NaN)", NaN],
				["string (empty)", ""],
				["object (non-empty)", { property: "value" }],
				["object (empty)", {}],
				["array (non-empty)", [1, 2, 3]],
				["array (empty)", []],
				["null", null],
				["undefined", undefined],
			])("%s", ([, input]) => {
				expect(parseUrlParams(input)).toEqual({});
			});
		});

		test("Parses basic URL parameters", () => {
			const url = "https://howles.dev?in-cinema=068&at=2026-01-09&view-mode=list";

			expect(parseUrlParams(url)).toEqual({
				"in-cinema": "068",
				"at": "2026-01-09",
				"view-mode": "list",
			});
		});

		test("Parses hash parameters", () => {
			const url = "https://howles.dev#?in-cinema=001&at=2000-01-01&view-mode=list";

			expect(parseUrlParams(url)).toEqual({
				"in-cinema": "001",
				"at": "2000-01-01",
				"view-mode": "list",
			});
		});

		test("Does not parse hash parameters if no `?` is included", () => {
			const url = "https://howles.dev#in-cinema=001&at=2000-01-01&view-mode=list";

			expect(parseUrlParams(url)).toEqual({});
		});

		test("Combines parameters, prioritising basic parameters", () => {
			const url = "https://howles.dev?in-cinema=068#?in-cinema=001&at=2000-01-01&view-mode=list";

			expect(parseUrlParams(url)).toEqual({
				"in-cinema": "068",
				"at": "2000-01-01",
				"view-mode": "list",
			});
		});
	});

	describe("getDatesFromDays", () => {
		describe("non-array input returns a non-empty array", () => {
			test.for([
				["boolean (true)", true],
				["boolean (false)", false],
				["number (positive)", 1],
				["number (negative)", -1],
				["number (NaN)", NaN],
				["string (non-empty)", "string"],
				["string (empty)", ""],
				["array (empty)", []],
				["object (non-empty)", { property: "value" }],
				["object (empty)", {}],
				["null", null],
				["undefined", undefined],
			])("%s", ([, input]) => {
				expect(getDatesFromDays(input)).toEqual([]);
			});
		});

		test("Given a number of days of the week, return corresponding dates", () => {
			const days = ["Today", "Monday", "Tuesday", "Wednesday", "Thursday"];

			expect(getDatesFromDays(days)).toEqual([
				{
					day: "Today",
					date: expect.any(String),
				},
				{
					day: "Monday",
					date: expect.any(String),
				},
				{
					day: "Tuesday",
					date: expect.any(String),
				},
				{
					day: "Wednesday",
					date: expect.any(String),
				},
				{
					day: "Thursday",
					date: expect.any(String),
				},
			]);
		});
	});
});
