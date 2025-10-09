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

	// Load our page and retrieve the required data.
	const listings = await page.evaluate(async() => {
		/**
		 * For a given selector, attempt to retrieve its text content. If we
		 * cannot, simply return an empty string.
		 *
		 * @param  {object}  basis
		 *     The basis, within which we search for our selector. For example,
		 *     `document`.
		 * @param  {string}  selector
		 *     The selector for the element to read.
		 */
		function getTextContentForSelector(selector) {
			try {
				const element = document.querySelector(selector);

				return element.textContent;
			} catch {
				return "";
			}
		}

		return {
			name: window.name,
			description: getTextContentForSelector(".subheading"),
			movieCount: document.querySelectorAll(".movie-row").length,
		};
	});

	await browser.close();

	return listings;
}
