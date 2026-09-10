const Booking = require("../models/Booking");
const Otp = require("../models/OTP");
const Event = require("../models/Events");
const { sendOtpEmail, sendBookingEmail } = require("../utils/email");

const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
}

exports.sendBookingOtp = async (req, res) => {
    const opt = generateOtp();
    await Otp.findOneAndDelete({ email: req.user.email, action: 'event-booking' }); // Delete any existing OTPs for this email and action
    await Otp.create({ email: req.user.email, otp: opt, action: 'event-booking' });
    await sendOtpEmail(req.user.email, opt, 'event-booking'); // Send OTP email to the user
    res.status(200).json({ message: "OTP sent to email for booking confirmation." });
};

exports.bookEvent = async (req, res) => {
    const { eventId, otp } = req.body;
    const otpRecord = await Otp.findOne({ email: req.user.email, otp, action: 'event-booking' });

    if (!otpRecord) {
        return res.status(400).json({ error: "Invalid OTP" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
        return res.status(404).json({ error: "Event not found" });
    }

    if(event.totalSeats <= 0) {
        return res.status(400).json({ error: "No seats available for this event" });
    }

    const existingBooking = await Booking.create({
        userId: req.user._id,
        eventId: eventId,
        numberOfTickets: 1,
        status: 'pending',
        paymentStatus: 'non_paid',
        amount: event.ticketPrice
    });

    await Otp.deleteMany({ email: req.user.email, action: 'event-booking' }); // Delete the OTP after successful booking
    res.status(200).json({ message: "Booking successful. Confirmation email sent." });

}


exports.confirmBooking = async (req, res) => {  
    const paymentStatus = req.body.paymentStatus; // 'paid' or 'non_paid'

    if(!['paid', 'non_paid'].includes(paymentStatus)) {
        return res.status(400).json({ error: "Invalid payment status" });
    }

    const booking = await Booking.findById(req.params.id).populate('event').populate('user');
    if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
    }

    if(booking.status === 'confirmed') {
        return res.status(400).json({ error: "Booking is already confirmed" });
    }

    const event = await Event.findById(booking.event._id);
    if(event.totalSeats <= 0) {
        return res.status(400).json({ error: "No seats available for this event" });
    }

    booking.status = 'confirmed';

    if(paymentStatus) {
        booking.paymentStatus = paymentStatus;
    }
    await booking.save();
    event.totalSeats -= 1;
    await event.save();
    await sendBookingEmail(req.user.email, event.title, booking._id);

    res.json({message : 'Booking confirmed'});

};

exports.getMyBookings = async (req, res) => {

    const bookings = await Booking.find({userId: req.user._id}).populate('eventId');
    res.json(bookings);
}

exports.cancelBooking = async (req, res) => {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
        return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ error: 'Unauthorized' });
    }

    const wasConfirmed = booking.status === 'confirmed';
    booking.status = 'cancelled';

    if (wasConfirmed) {
        const event = await Event.findById(booking.eventId);
        if (event) {
            event.totalSeats += booking.numberOfTickets;
            await event.save();
        }
    }

    await booking.deleteOne();
    res.json({ message: 'Booking cancelled' });
};

