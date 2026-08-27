const Event = require("../models/Events");

exports.getAllEvents = async (req, res) => {
    try {

        const filters = {};
        if (req.query.category) {
            filters.category = req.query.category;
        }
        if (req.query.ticketPrice) {
            const priceRange = req.query.ticketPrice.split("-");
            filters.ticketPrice = { $gte: parseFloat(priceRange[0]), $lte: parseFloat(priceRange[1]) };
        }

        const events = await Event.find(filters);
        res.status(200).json(events);
    }
    catch (error) {
        res.status(500).json({ error: error.message});

    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createEvent = async (req, res) => {
    
    const { title, description, date, time, location, category, totalSeats, ticketPrice, imageUrl } = req.body;

    try {
        const event = await Event.create(req.params.id, {

            title,
            description,
            date,
            time,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl,
            createdBy: req.user._id
        } )
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
        
}
        


exports.updateEvent = async (req, res) => {
    const { title, description, date, time, location, category, totalSeats, ticketPrice, imageUrl } = req.body;

    try {
        const event = await Event.findByIdAndUpdate(req.params.id, {
            title,
            description,
            date,
            time,
            location,
            category,
            totalSeats,
            ticketPrice,
            imageUrl
        }, { new: true, runValidators: true });

        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.status(200).json({ message: "Event deleted successfully" });

    }

    catch (error) {
        res.status(500).json({ error: error.message });
    }
};