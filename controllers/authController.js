const User = require("../models/User");
const OTP = require("../models/OTP");
const bcrypt = require("bcryptjs");
const { sendOtpEmail } = require("../utils/email");
const jwt = require("jsonwebtoken");


const generateToken = (id, role) => {

    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30days' });
}

//Register user

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({ error: "Name, email and password are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ error: "User already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const user = await User.create({ name, email, password: hashedPassword, role: 'user' });
        // await user.save();
        // res.status(201).json({ message: "User registered successfully" });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Here you would typically send the OTP to the user's email or phone
        console.log(`OTP for ${email}: ${otp}`);
        await OTP.create({email, otp, action: 'account-verification'});
        await sendOtpEmail(email, otp, 'account-verification'); // Send OTP email to the user

        res.status(201).json({ message: "User registered successfully. OTP sent to email for verification.",
            email: user.email
         });

        // user.otp = otp;

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

//Login User
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        if (!user.isVerified && user.role === 'user') {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            await OTP.deleteMany({ email, action: 'account-verification' });
            await OTP.create({ email, otp, action: 'account-verification' });
            await sendOtpEmail(email, otp, 'account-verification');
            return res.status(400).json({
                error: 'Account not verified. OTP sent to email for verification.',
            });
        }

        res.status(200).json({
            message: 'Login successful',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role)
            }
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ error: "Email and OTP are required" });
        }

        const otpRecord = await OTP.findOne({ email, otp, action: 'account-verification' });

        if (!otpRecord) {
            return res.status(400).json({ error: "Invalid or expired OTP" });
        }

        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        await OTP.deleteMany({ email, action: 'account-verification' });
        res.json({
            message: 'Account verified successfully',
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role)
        });
    } catch (error) {
        console.error("OTP verification error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}
