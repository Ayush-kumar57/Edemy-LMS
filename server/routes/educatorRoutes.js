import express from 'express';
import {
  addCourse,
  updateRoleToEducator,
} from '../controllers/educatorController.js';
import upload from '../configs/multer.js';
import { protectEducator } from '../middlewares/authMiddleware.js';
import { requireAuth } from "@clerk/express";


const educatorRouter = express.Router();

// Add Educator Role
educatorRouter.get('/update-role', requireAuth(), updateRoleToEducator);

educatorRouter.post(
  '/add-course',
  requireAuth(),
  upload.single('image'), 
  protectEducator,
  addCourse,
);

export default educatorRouter;
