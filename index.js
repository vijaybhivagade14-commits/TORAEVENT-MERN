const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");


dotenv.config();

const authRoutes = require("./routes/auth");
const eventsRoutes = require("./routes/events");
const bookingRoutes = require("./routes/booking");

const app = express();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON request bodies

//Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/bookings', bookingRoutes);


//connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

