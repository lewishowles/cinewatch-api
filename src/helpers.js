import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { isNonEmptyString, ltrim } from "@lewishowles/helpers/string";

/**
 * Given a provided URL, standardise the URL into something that can be used to
 * load the appropriate branch page, with optional date. The only information we
 * need for our purposes are the base URL and any date specified. This is
 * currently geared toward Cineworld, based on the structure of their branch
 * URLs.
 *
 * @param  {string}  rawUrl
 *     The provided URL from which to determine our base branch URL
 */
export function getSearchData(rawUrl, date) {
	if (!isNonEmptyString(rawUrl)) {
		throw new Error("We couldn't find a URL for the desired branch.");
	}

	try {
		const url = new URL(rawUrl);
		const searchParams = parseUrlParams(rawUrl);

		// Determine any specified date, either in the URL itself or directly.
		let selectedDate = null;

		if (isNonEmptyString(date)) {
			selectedDate = date;
		} else if (Object.hasOwn(searchParams, "at")) {
			selectedDate = searchParams.at;
		}

		// Start building our URL, optionally including an "at" parameter for
		// the date if present. The date can be present either in parameters, or
		// provided directly, which will take precedence.
		const baseUrl = `${url.origin}${url.pathname}`;
		const urlParts = [baseUrl];

		if (isNonEmptyString(selectedDate)) {
			urlParts.push(`#?at=${selectedDate}`);
		}

		return {
			baseUrl,
			fullUrl: urlParts.filter(part => part).join(""),
			selectedDate,
		};
	} catch {
		throw new Error("The provided URL doesn't seem to be correct.");
	}
}

/**
 * Parse a given URL string into parameters, combining any natural parameters
 * with any hidden in a hash, which is the process followed by Cineworld.
 * Primary parameters take precedence over those in a hash.
 *
 * @param  {string}  rawUrl
 *     The raw URL to parse
 */
export function parseUrlParams(rawUrl) {
	if (!isNonEmptyString(rawUrl)) {
		return {};
	}

	try {
		const url = new URL(rawUrl);
		const primaryParams = new URLSearchParams(url.search);
		const hash = ltrim(url.hash, "#");

		let hashParams = new URLSearchParams();

		if (hash.includes("?")) {
			const hashUrl = new URL(hash, url.origin);

			hashParams = new URLSearchParams(hashUrl.search);
		}

		// Combine our parameter sets, prioritising natural parameters.
		const combinedParams = {};

		for (const [key, value] of hashParams.entries()) {
			combinedParams[key] = value;
		}

		for (const [key, value] of primaryParams.entries()) {
			combinedParams[key] = value;
		}

		return combinedParams;
	} catch {
		return {};
	}
};

/**
 * Retrieve a number of dates, corresponding to the provided length, and
 * starting with today, in the format YYYY-MM-DD.
 *
 * @param  {number}  days
 *     The number of dates to retrieve.
 */
export function getDatesFromDays(days) {
	if (!isNonEmptyArray(days)) {
		return [];
	}

	return days.map((day, index) => {
		const date = new Date();

		date.setDate(date.getDate() + index);

		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const dd = String(date.getDate()).padStart(2, "0");

		return {
			day,
			date: `${yyyy}-${mm}-${dd}`,
		};
	});
}
