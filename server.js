import cors from "cors";
import express from "express";
import getFilmListings from "./routes/cineworld/films/index.js";

// Set up our app. Render sets our port via the PORT environment variable.
const app = express();
const PORT = process.env.PORT || 3000;

// Allow CORS from our allowed domains.
const allowedOrigins = [
	/^http:\/\/localhost(:\d+)?$/,
	/^https:\/\/(www\.)?lewishowles\.github\.io(\/.*)?$/,
	/^https:\/\/([a-zA-Z0-9-]+\.)*howles\.dev(\/.*)?$/,
];

app.use(cors({
	origin(origin, callback) {
		// This lets us allow non-browser tools with no origin, such as curl,
		// health checks, etc.
		if (!origin) {
			return callback(null, true);
		}

		const allowed = allowedOrigins.some(pattern => pattern.test(origin));

		if (allowed) {
			return callback(null, true);
		}

		return callback(new Error("Not allowed by CORS"));
	},
}));

// Simple health check to confirm operation.
app.get("/health", (request, response) => {
	response.json({ status: "ok" });
});

// Retrieve information for a branch, allowing the user to confirm it is
// correct, and choose from available dates.
app.get("/api/cineworld/films", getFilmListings);

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
