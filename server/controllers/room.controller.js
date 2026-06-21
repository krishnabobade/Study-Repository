const Room = require('../models/Room');
const Message = require('../models/Message');
const logger = require('../config/logger');

// Seed default rooms if database is empty of rooms
const seedDefaultRooms = async () => {
  const count = await Room.countDocuments();
  if (count === 0) {
    const defaults = [
      { name: 'General Chat', description: 'General college discussions and chat.', course: '', semester: null },
      { name: 'Exam Prep Hub', description: 'Discuss tips, PYQs, and prepare for upcoming exams.', course: '', semester: null },
      { name: 'Placement & Internships', description: 'Share job opportunities and interview prep guidance.', course: '', semester: null }
    ];
    await Room.insertMany(defaults);
    logger.info('✅ Seeded default study rooms.');
  }
};

exports.getRooms = async (req, res) => {
  try {
    await seedDefaultRooms();
    
    // Allow users to see all general rooms and optionally filter by their course/semester
    const { course, semester } = req.query;
    
    let query = {
      $or: [
        { course: '' }, // Global rooms
        { isPrivate: false }
      ]
    };

    if (course) {
      query.$or.push({ course });
    }
    
    const rooms = await Room.find(query)
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 });

    res.json({ success: true, rooms });
  } catch (err) {
    logger.error('Error fetching rooms:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, description, course, semester, isPrivate } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Room name is required' });
    }

    const createdBy = req.user ? req.user.id : null;

    const room = await Room.create({
      name,
      description,
      course: course || '',
      semester: semester ? Number(semester) : undefined,
      isPrivate: !!isPrivate,
      createdBy
    });

    res.status(201).json({ success: true, room });
  } catch (err) {
    logger.error('Error creating room:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getRoomMessages = async (req, res) => {
  try {
    const { roomId } = req.params;
    
    // Check if room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Fetch last 100 messages for this room
    const messages = await Message.find({ room: roomId })
      .populate('sender', 'name email avatar role')
      .sort({ createdAt: -1 })
      .limit(100);

    // We want the frontend to display them in chronological order
    res.json({ success: true, messages: messages.reverse() });
  } catch (err) {
    logger.error('Error fetching room messages:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
