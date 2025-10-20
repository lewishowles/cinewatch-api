import puppeteer from "puppeteer";

import { isNonEmptyArray } from "@lewishowles/helpers/array";
import { isNonEmptyString } from "@lewishowles/helpers/string";

/**
 * Given the URL for a branch page, retrieve the list of films available at that
 * branch to facilitate booking.
 */
export default async (request, response) => {
	const { url } = request.query;

	try {
		const branchUrl = getBranchUrl(url);
		const data = await loadBranchData(branchUrl);

		return response.json({ data });
	} catch(error) {
		return response.status(400).json({ error: error.message });
	}
};

/**
 * Given a provided URL, standardise the URL into something that can be used to
 * load the appropriate Cineworld page.
 *
 * @param  {string}  url
 *     The provided URL from which to determine our base branch URL
 */
function getBranchUrl(url) {
	if (!isNonEmptyString(url)) {
		throw new Error("We couldn't find a URL for the desired branch.");
	}

	try {
		const parsedUrl = new URL(url);

		return `${parsedUrl.origin}${parsedUrl.pathname}`;
	} catch {
		throw new Error("The provided URL doesn't seem to be correct.");
	}
}

/**
 * Load the desired information for our page, based on loading that page in
 * puppeteer and querying the result.
 *
 * @param  {string}  url
 *     The URL of the page to load.
 */
async function loadBranchData(url) {
	const browser = await puppeteer.launch({
		args: ["--no-sandbox", "--disable-setuid-sandbox"],
	});

	const page = await browser.newPage();

	await page.goto(url, {
		waitUntil: "networkidle2",
		timeout: 60000,
	});

	await page.exposeFunction("getDatesFromDays", getDatesFromDays);

	// Load our page and retrieve the required data.
	const listings = await page.evaluate(async() => {
		// We define a number of helper functions that rely on the document
		// within page.evaluate, which has access to the DOM as it runs in the
		// browser context. Methods outside the browser context cannot be
		// called, and methods using the DOM cannot be passed via
		// exposeFunction.

		// Further, `addScriptTag` would require the helpers to be written as a
		// text block, or use `eval`, and multiple calls to `page.evaluate`
		// would pose the same organisation issue as this.

		/**
		 * For a given selector, attempt to retrieve a single element's text
		 * content. If we cannot, simply return an empty string.
		 *
		 * @param  {object}  basis
		 *     The basis, within which we search for our selector. For example,
		 *     `document`.
		 * @param  {string}  selector
		 *     The selector for the element to read.
		 */
		function getTextContentForSelector(basis, selector) {
			if (!(basis instanceof Node) || typeof selector !== "string") {
				return "";
			}

			try {
				const element = basis.querySelector(selector);

				return element.textContent.trim();
			} catch {
				return "";
			}
		}

		/**
		 * For a given selector, attempt to retrieve the text content for all
		 * matching elements. If we cannot, simply return an empty string.
		 *
		 * @param  {object}  basis
		 *     The basis, within which we search for our selector. For example,
		 *     `document`.
		 * @param  {string}  selector
		 *     The selector for the element to read.
		 */
		function getTextContentsForSelector(basis, selector) {
			if (!(basis instanceof Node) || typeof selector !== "string") {
				return [];
			}

			try {
				const elements = basis.querySelectorAll(selector);

				const textContent = [];

				elements.forEach(element => {
					try {
						textContent.push(element.textContent.trim());
					} catch {
						return;
					}
				});

				return textContent;
			} catch {
				return [];
			}
		}

		/**
		 * For a given selector, attempt to retrieve a single element's text
		 * content. If we cannot, simply return an empty string.
		 *
		 * @param  {object}  basis
		 *     The basis, within which we search for our selector. For example,
		 *     `document`.
		 * @param  {string}  attributeName
		 *     The name of the attribute whose value to retrieve.
		 * @param  {string}  selector
		 *     Any additional selector to find within the provided basis.
		 */
		function getAttributeValue(basis, attributeName, selector) {
			if (!(basis instanceof Node) || typeof attributeName !== "string") {
				return "";
			}

			try {
				let element = basis;

				if (selector) {
					element = basis.querySelector(selector);
				}

				return element.getAttribute(attributeName).trim();
			} catch {
				return "";
			}
		}

		/**
		 * Get the details of the branch represented on the current page.
		 */
		async function getBranchDetails() {
			// The name of this branch.
			const name = window.name;
			// A description for this branch.
			const description = getTextContentForSelector(document, ".subheading");
			// Our list of available days to choose from. These days are those
			// displayed by default, and start with "Today". More days are
			// available via a calendar, but only advanced screenings are
			// generally shown there, which doesn't suit our use-case.
			const days = getTextContentsForSelector(document.querySelector(".qb-days-group"), ".btn-default");
			// Our list of available dates.
			const dates = await getDatesFromDays(days);

			return {
				name,
				description,
				dates,
			};
		}

		/**
		 * Get the title of the provided film.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 *
		 * @returns  {string}
		 *     The name of the film being shown.
		 */
		function getFilmTitle(film) {
			return getTextContentForSelector(film, ".qb-movie-name");
		}

		/**
		 * Film posters are lazy-loaded after the page has loaded, which means
		 * for any given poster, the correct source could be in either
		 * `data-src`, or `src`, and `data-src` is not preserved after the
		 * lazy-load occurs.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 *
		 * @returns  {string}
		 *     The URL of the poster to display for the film.
		 */
		function getFilmPosterUrl(film) {
			return getAttributeValue(film, "data-src", ".movie-poster-container img") ||
				getAttributeValue(film, "src", ".movie-poster-container img");
		}

		/**
		 * Film posters are lazy-loaded after the page has loaded, which means
		 * for any given poster, the correct source could be in either
		 * `data-src`, or `src`, and `data-src` is not preserved after the
		 * lazy-load occurs.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 *
		 * @returns  {string}
		 *     The URL of the poster to display for the film.
		 */
		function getFilmDetailsUrl(film) {
			return getAttributeValue(film, "href", ".qb-movie-link");
		}

		/**
		 * Get the URL for the rating representing this film, and the alt text
		 * for that rating.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 *
		 * @returns  {object}
		 *     The rating icon URL and alt text for that rating.
		 */
		function getFilmRating(film) {
			return {
				url: getAttributeValue(film, "src", ".rating-icon"),
				alt: getAttributeValue(film, "alt", ".rating-icon"),
			};
		}

		/**
		 * Get the genre or genres that this film belongs to.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 *
		 * @returns  {string}
		 *     The text of the genre, e.g. "Comedy".
		 */
		function getFilmGenreText(film) {
			return getTextContentForSelector(film, ".qb-movie-info-wrapper .mr-sm").replace(" |", "");
		}

		/**
		 * Get the genre or genres that this film belongs to.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 *
		 * @returns  {integer}
		 *     The duration of the film, in minutes, e.g. "128".
		 */
		function getFilmDuration(film) {
			return parseInt(getTextContentForSelector(film, ".qb-movie-info-wrapper .mr-xs")) || 0;
		}

		/**
		 * Get the types of screening available for this film, and the times for
		 * each showing of the film within, where a "screening" is, for example,
		 * 2D, IMAX, etc.
		 *
		 * @param  {object}  film
		 *     The film within which to search.
		 * @param  {integer}  duration
		 *     The duration of the film, allowing us to calculate screening end
		 *     times.
		 *
		 * @returns  {array}
		 *     The list of screening types, and the times of each film within.
		 */
		function getFilmScreenings(film, duration) {
			if (!(film instanceof Node)) {
				return [];
			}

			// If we can't find any screening attributes, this is a film that is
			// not yet available to book.
			if (!film.querySelector(".qb-screening-attributes")) {
				return [];
			}

			const screenings = [];

			film.querySelectorAll(".qb-movie-info-column").forEach(screening => {
				screenings.push({
					label: getTextContentsForSelector(screening, ".qb-screening-attributes span").join(" "),
					subtitled: getTextContentForSelector(screening, ".qb-movie-attributes").includes("Subtitled"),
					times: getScreeningTimes(screening, duration),
				});
			});

			return screenings;
		}

		/**
		 * Get the available times for a given screening row, where a
		 * "screening" is, for example, 2D, IMAX, etc. To make things simpler in
		 * the future, we include the start time, end time, and booking URL for
		 * each particular showing.
		 *
		 * @param  {object}  screening
		 *     The wrapper containing the details for a single screening type.
		 * @param  {integer}  duration
		 *     The duration of this film, used to calculate the end time of a
		 *     given film.
		 *
		 * @returns  {array}
		 *     The list of times.
		 */
		function getScreeningTimes(screening, duration) {
			if (!(screening instanceof Node)) {
				return [];
			}

			function getDateTimeStringFromOffset(startTime, offsetMinutes = 0) {
				if (typeof startTime !== "string") {
					return { label: "", value: "" };
				}

				const [hours, minutes] = startTime.split(":").map(Number);

				const date = new Date();

				date.setHours(hours);
				date.setMinutes(minutes + offsetMinutes);
				date.setSeconds(0);
				date.setMilliseconds(0);

				return {
					label: `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`,
					value: date.toISOString(),
				};
			}

			const times = [];

			screening.querySelectorAll(".btn-primary").forEach(time => {
				times.push({
					start: getDateTimeStringFromOffset(time.textContent),
					end: getDateTimeStringFromOffset(time.textContent, duration),
					booking_url: getAttributeValue(time, "data-url"),
				});
			});

			return times;
		}

		/**
		 * Get the details for the films available at this branch from the page. Films
		 * will contain basic information, such as title, poster, genre, length, and
		 * rating. Films available to book will include times of those showings, and
		 * films coming soon will include the first date that film is available.
		 */
		function getFilmDetails() {
			const films = [];

			document.querySelectorAll(".qb-movie").forEach(film => {
				const duration = getFilmDuration(film);

				films.push({
					title: getFilmTitle(film),
					url: getFilmDetailsUrl(film),
					poster: {
						url: getFilmPosterUrl(film),
					},
					rating: getFilmRating(film),
					genre: getFilmGenreText(film),
					duration_minutes: duration,
					screenings: getFilmScreenings(film, duration),
				});
			});

			return films;
		}

		// Our branch details.
		const branch = await getBranchDetails();
		// The available films for this branch.
		const films = getFilmDetails();

		return {
			branch,
			films,
		};
	});


	return listings;
}

/**
 * Retrieve a number of dates, corresponding to the provided length, and
 * starting with today, in the format YYYY-MM-DD.
 *
 * @param  {number}  days
 *     The number of dates to retrieve.
 */
function getDatesFromDays(days) {
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
