
import { isNonEmptyString } from "@lewishowles/helpers/string";

/**
 * Given a URL in the query, load the details required to show information about
 * a given Cineworld branch.
 */
export default async (request, response) => {
	const { url } = request.query;

	try {
		const branchUrl = getBranchUrl(url);

		response.json({ branchUrl });
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
