import { clerkClient, getAuth } from '@clerk/express';
import { v2 as cloudinary } from 'cloudinary';
import Course from '../models/Course.js';

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

    // const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
    //   resource_type: 'auto',
    //   invalidate: true,
    // });

    console.log('here testing code is working');

    // simple for testing.
    //const imageUpload = await cloudinary.uploader.upload(imageFile.path);

    console.log('After that code is also working');

    // newCourse.courseThumbnail = imageUpload.secure_url;
    await newCourse.save();

    res
      .status(201)
      .json({ success: true, message: 'Course Created Successfully' });
  } catch (error) {
    console.error('FULL ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Error in addCourse controller',
    });
  }
};
