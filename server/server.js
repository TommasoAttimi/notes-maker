//server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
  origin: "https://nimble-mooncake-8c9bc2.netlify.app", // or '*' to allow all origins
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Connect to MongoDB Atlas
const dbURI = process.env.MONGO_URI;
mongoose
  .connect(dbURI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Define Note model
const Note = mongoose.model("Note", {
  title: String,
  content: String,
});

// Listen for successful MongoDB connection
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB Atlas");
});

// Listen for MongoDB connection errors
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

// Routes
app.get("/", (req, res) => {
  res.send("Hello, this is the root!");
});

app.get("/api/notes", async (req, res) => {
  try {
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Note by ID
// Update Note by ID
app.put("/api/notes/:id", async (req, res) => {
  const { title, content } = req.body;
  const noteId = req.params.id;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      { title, content },
      { new: true }
    );
    res.json(updatedNote);
  } catch (error) {
    res.status(404).json({ message: "Note not found" });
  }
});

// Delete Note by ID
app.delete("/api/notes/:id", async (req, res) => {
  const noteId = req.params.id;

  try {
    await Note.findByIdAndDelete(noteId);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(404).json({ message: "Note not found" });
  }
});

app.post("/api/notes", async (req, res) => {
  const { title, content } = req.body;

  const note = new Note({ title, content });

  try {
    const newNote = await note.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
