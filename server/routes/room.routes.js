const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const auth = require('../middleware/auth');

router.get('/', auth.protect, roomController.getRooms);
router.post('/', auth.protect, roomController.createRoom);
router.get('/:roomId/messages', auth.protect, roomController.getRoomMessages);

module.exports = router;
