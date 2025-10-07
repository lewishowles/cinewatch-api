import express from 'express';

// Set up our app. Render sets our port via the PORT environment variable.
const app = express();
const PORT = process.env.PORT || 3000;

// Define our endpoint
app.get('/api/cineworld', async (req, res) => {
	res.json({ message: "Hello" });
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
