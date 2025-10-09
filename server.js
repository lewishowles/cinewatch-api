import express from "express";
import getBranchDetails from "./routes/cineworld/branch.js";

// Set up our app. Render sets our port via the PORT environment variable.
const app = express();
const PORT = process.env.PORT || 3000;

// Retrieve information for a branch, allowing the user to confirm it is
// correct, and choose from available dates.
app.get("/api/cineworld/branch", getBranchDetails);

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
