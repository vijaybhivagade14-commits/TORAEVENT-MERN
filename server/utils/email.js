const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.sendOtpEmail = async (userEmail, otp, type) => {
    try {
        const title = type === 'account-verification' ? 'Account Verification' : type === 'login' ? 'Login' : 'Event Booking';
        const msg = type === 'account-verification' ? `Your OTP code for account verification is: ${otp}. It will expire in 5 minutes.` : type === 'login' ? `Your OTP code for login is: ${otp}. It will expire in 5 minutes.` : `Your OTP code for event booking is: ${otp}. It will expire in 5 minutes.`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: title,
            text: msg
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${userEmail} for ${type}`);
    } catch (error) {
        console.error("Error sending OTP email:", error);
    }
};

const sendBookingEmail = async (userEmail, userName, eventTitle) => {
    try {   
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: userEmail,
            subject: 'Booking Confirmation',
            text: `Hello ${userName}, your booking has been confirmed. Thank you for choosing our service!`
        };

        await transporter.sendMail(mailOptions);
        console.log(`Booking email sent to ${userEmail}`);
    } catch (error) {
        console.error("Error sending booking email:", error);
    }
};

const sendEmail = async (to, subject, text) => {
    try {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your OTP Verification Code',
        text: `Your OTP code is: ${otp}`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email} with subject "${subject}" and text "${text}"`);
}
 catch(error) {
    console.error("Error sending email:", error);
 }
};

const sendOTPEmail = async (userEmail, otp, type) => {
    try {

        const title = type === 'account-verification' ? 'Account Verification' : type === 'login' ? 'Login' : 'Event Booking';
        const msg = type === 'account-verification' ? `Your OTP code for account verification is: ${otp}. It will expire in 5 minutes.` : type === 'login' ? `Your OTP code for login is: ${otp}. It will expire in 5 minutes.` : `Your OTP code for event booking is: ${otp}. It will expire in 5 minutes.`;   

        const mailOptions = {
            from: process.env.EMAIL_USER,  
            to: userEmail,
            subject: title,
            text: `Your OTP code for ${type} is: ${otp}. It will expire in 5 minutes.`
        };

        module.exports = { sendBookingEmail, sendEmail, sendOtpEmail    };
        console.log(`OTP email sent to ${userEmail} for ${type}`);
    
} catch (error) { 
    res.status(500).json({ error: "Error sending OTP email" });
    console.error("Error sending OTP email:", error);
}
}