import express from 'express'
import { protectedRoute } from '../middleware/protectedRoute.js';
import { getNotification , deleteNotifications, deleteNotification } from '../controllers/notification.routes.js';

const router = express.Router()


router.get('/', protectedRoute, getNotification)

router.delete('/' , protectedRoute, deleteNotifications)

router.delete('/:id', protectedRoute, deleteNotification)

export default router;