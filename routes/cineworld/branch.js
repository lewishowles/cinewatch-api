import puppeteer from "puppeteer";

import { isNonEmptyString } from "@lewishowles/helpers/string";

/**
 * Given a URL in the query, load the details required to show information about
 * a given Cineworld branch.
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

	await page.exposeFunction("getDates", getDates);

	// Load our page and retrieve the required data.
	const listings = await page.evaluate(async() => {
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
			try {
				const elements = basis.querySelectorAll(selector);

				const textContent = [];

				elements.forEach(element => {
					try {
						textContent.push(element.textContent.trim());
					} catch {
						// Intentionally empty
					}
				});

				return textContent;
			} catch {
				return [];
			}
		}

		// Our list of available days to choose from. These days are those
		// displayed by default. More days are available, but only advanced
		// screenings are generally shown there, which doesn't suit our
		// use-case.
		const days = getTextContentsForSelector(document.querySelector(".qb-days-group"), ".btn-default");
		// Our list of available dates. We start with today, and work forward,
		// based on the number of days returned.
		const dates = await getDates(days.length);

		return {
			name: window.name,
			description: getTextContentForSelector(document, ".subheading"),
			days,
			dates,
		};
	});

	await browser.close();

	return listings;
}

/**
 * Retrieve a number of dates, corresponding to the provided length, and
 * starting with today, in the format YYYY-MM-DD.
 *
 * @param  {number}  length
 *     The number of dates to retrieve.
 */
function getDates(length) {
	if (!Number.isInteger(length) || length <= 0) {
		return [];
	}

	const dates = [];

	for (let i = 0; i < length; i++) {
		const date = new Date();

		date.setDate(date.getDate() + i);

		const yyyy = date.getFullYear();
		const mm = String(date.getMonth() + 1).padStart(2, "0");
		const dd = String(date.getDate()).padStart(2, "0");

		dates.push(`${yyyy}-${mm}-${dd}`);
	}

	return dates;
}
