import express, { Request, Response } from "express";
import cors from "cors";
import path from "path";

const app = express();
const PORT = process.env.PORT || 3012;

// Enable CORS for all routes
app.use(cors());

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, "../dist")));

// Handle SPA routing - serve index.html for any route that doesn't match a file
app.get("*", (req: Request, res: Response) => {
  // Check if the request is for a file that exists
  const filePath = path.join(__dirname, "../dist", req.path);

  // If the file doesn't exist and it's not an API route, serve the main index
  if (!req.path.startsWith("/api/")) {
    res.sendFile(
      path.join(__dirname, "../dist/index.html"),
      (err: Error | null) => {
        if (err) {
          // If index.html doesn't exist, just serve the requested file or 404
          res.status(404).send("File not found");
        }
      }
    );
  } else {
    res.status(404).send("API endpoint not found");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📁 Serving files from: ${path.join(__dirname, "../dist")}`);
});
