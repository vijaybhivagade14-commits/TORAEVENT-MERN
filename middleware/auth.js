const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to protect routes and verify JWT token
const protect = async (req, res, next) => {
    let token = req.headers.authorization && req.headers.authorization.startsWith("Bearer") ? req.headers.authorization.split(" ")[1] : null;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({ error: "Not authorized, user not found" });
            }

            next();
        }
        catch (error) {
            res.status(401).json({ error: "Not authorized, token failed" });
        }
    } else {
        res.status(401).json({ error: "Not authorized, no token" });
    }
};

// Middleware to check if the user is an admin
const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next();
    } else {
        res.status(403).json({ error: "Not authorized as an admin" });
    }
};





// const OTP = require("../models/OTP");
// const bcrypt = require("bcryptjs");
// const { sendOtpEmail } = require("../utils/email");

module.exports = { protect, admin };

