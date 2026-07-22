import { clerkClient, getAuth } from '@clerk/express';
import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';
import fs from 'fs';

// Update role to educator
export const updateRoleToEducator = async (req, res) => {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: 'educator',
      },
    });
    res.json({ success: true, message: 'You can publish a course now' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Add New Course

export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file;
    const { userId: educatorId } = getAuth(req);

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        message: 'Course thumbnail is Not Attached',
      });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = educatorId;

    const newCourse = await Course.create(parsedCourseData);

    

    try {
      const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: 'image',
      });

      newCourse.courseThumbnail = imageUpload.secure_url;
    } catch (error) {
      if (error.response) {
        console.log('\nResponse:');
        console.dir(error.response, { depth: null });
      }

      if (error.request) {
        console.log('\nRequest:');
        console.dir(error.request, { depth: null });
      }

      if (error.error) {
        console.log('\nCloudinary Error:');
        console.dir(error.error, { depth: null });
      }
      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }

    await newCourse.save();
    return res.status(201).json({
      success: true,
      message: 'Course Created Successfully',
    });
  } catch (error) {
  
    console.dir(error, { depth: null });

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
