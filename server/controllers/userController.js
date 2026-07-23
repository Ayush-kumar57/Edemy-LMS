import Course from '../models/Course.js';
import User from '../models/User.js';
import { getAuth } from '@clerk/express';
import { Purchase } from '../models/Purchase.js';
import Stripe from 'stripe';
import { CourseProgress } from '../models/CourseProgress.js';

// Get User Data
export const getUserData = async (req, res) => {
  try {
    const userId = getAuth(req).userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.json({ success: false, message: 'User Not Found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// User Enrolled Courses with lecture links

export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = getAuth(req).userId;
    const userData = await User.findById(userId).populate('enrolledCourses');

    res.json({ success: true, enrolledCourses: userData.enrolledCourses });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Purchase Course

export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = getAuth(req).userId;
    const userData = await User.findById(userId);
    const courseData = await Course.findById(courseId);

    if (!userData || !courseData) {
      return res.json({ success: false, message: 'Data Not Found' });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId,
      amount: (
        courseData.coursePrice -
        (courseData.discount * courseData.coursePrice) / 100
      ).toFixed(2),
    };

    const newPurchase = await Purchase.create(purchaseData);

    // Stripe Payment Integration
    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

    const currency = process.env.CURRENCY.toLowerCase() || 'USD';

    // Creating line items to for stripe

    const line_items = [
      {
        price_data: {
          currency,
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(purchaseData.amount) * 100,
        },
        quantity: 1,
      },
    ];
    const session = await stripeInstance.checkout.sessions.create({
      success_url: `${origin}/loading/my-enrollments`,
      cancel_url: `${origin}`,
      line_items: line_items,
      mode: 'payment',
      metadata: {
        purchaseId: newPurchase._id.toString(),
      },
      payment_intent_data: {
        metadata: {
          purchaseId: newPurchase._id.toString(),
        },
      },
    });

    res.json({ success: true, sessionUrl: session.url });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// update user course progress

export const updateUserCourseProgress = async (req, res) => {
  try {
    const userId = getAuth(req).userId;
    const { courseId, lectureId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });

    if (progressData) {
      if (progressData.lectutreCompleted.includes(lectureId)) {
        return res.json({
          success: true,
          message: 'Lecture Already Completed',
        });
      }
      progressData.lectutreCompleted.push(lectureId);
      await progressData.save();
    } else {
      await CourseProgress.create({
        userId,
        courseId,
        lectutreCompleted: [lectureId],
      });
    }

    res.json({ sucess: true, message: 'Progress Updated' });
  } catch (error) {
    res.json({ sucess: false, message: error.message });
  }
};


// get User Course progress

export const getUserCourseProgress = async(req,res)=>{
  try{
    const userId = getAuth(req).userId;
    const { courseId } = req.body;
    const progressData = await CourseProgress.findOne({ userId, courseId });

    res.json({sucess:true , progressData})

  }catch(error){
    res.json({success:false , message:error.message})
  }

}

// Add User Rating to course

export const addUserRating = async(req,res)=>{
  const userId = getAuth(req).userId;
  const {courseId , rating} =req.body;

  if(!courseId || !userId || !rating || rating < 1 || rating > 5){
    return res.json({success:false , message:"Invalid Details"});
  }
  try{
    const course = await Course.findById(courseId);
    if(!course){
      return res.json({success:false, message:'Course not found'});
    }

    const user = await User.findById(userId);

    if(!user || !user.enrolledCourses.includes(courseId)){
      return res.json({success:false , message:'User has not purchese this course'});
    }

    const existingratingIndex = course.courseRatings.findIndex(r =>r.userId === userId)

    if(existingratingIndex > -1){
      course.courseRatings[existingratingIndex].rating = rating;
    }else{
      course.courseRatings.push({userId, rating})
    }
    await course.save();

    return res.json({success:true , message: 'Rating added'})
  }catch(error){
    return res.json({success:false , message:error.message})
  }
}