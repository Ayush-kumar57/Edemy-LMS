import { Webhook } from 'svix';
import User from '../models/User.js';
import Stripe from 'stripe';
import { Purchase } from '../models/Purchase.js';
import Course from '../models/Course.js';

// API Controller function to Manage Clerk User with Database

export const clearkWebhooks = async (req, res) => {
  try {
    const whook = new Webhook(process.env.CLERK_WEBHOOK_SECRET);

    await whook.verify(JSON.stringify(req.body), {
      'svix-id': req.headers['svix-id'],
      'svix-timestamp': req.headers['svix-timestamp'],
      'svix-signature': req.headers['svix-signature'],
    });

    const { data, type } = req.body;

    switch (type) {
      case 'user.created': {
        const userData = {
          _id: data.id,
          email: data.email_addresses[0].email_address,
          name: data.first_name + ' ' + data.last_name,
          imageUrl: data.image_url,
        };
        await User.create(userData);
        res.json({});
        break;
      }
      case 'user.updated': {
        const userData = {
          email: data.email_addresses[0].email_address,
          name: data.first_name + ' ' + data.last_name,
          imageUrl: data.image_url,
        };
        await User.findByIdAndUpdate(data.id, userData);
        res.json({});
        break;
      }

      case 'user.deleted': {
        await User.findByIdAndDelete(data.id);
        res.json({});
        break;
      }
      default:
        break;
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// webhook function for Stripe

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = Stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded': {
      const paymentIntent = event.data.object;

      const purchaseId = paymentIntent.metadata?.purchaseId;

      if (!purchaseId) {
        return res.status(400).json({
          success: false,
          message: 'Missing purchaseId in payment intent metadata',
        });
      }

      const purchaseData = await Purchase.findByIdAndUpdate(
        purchaseId,
        { status: 'completed' },
        { new: true },
      );

      if (!purchaseData) {
        return res.status(404).json({
          success: false,
          message: 'Purchase not found',
        });
      }

      const userData = await User.findById(purchaseData.userId);

      const courseData = await Course.findById(purchaseData.courseId.toString());

      if (!userData || !courseData) {
        return res.status(404).json({
          success: false,
          message: 'User or course not found',
        });
      }

      courseData.enrolledStudents.addToSet(purchaseData.userId);
      await courseData.save();

      userData.enrolledCourses.addToSet(courseData._id);
      await userData.save();
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object;
      const purchaseId = paymentIntent.metadata?.purchaseId;

      if (!purchaseId) {
        return res.status(400).json({
          success: false,
          message: 'Missing purchaseId in payment intent metadata',
        });
      }

      await Purchase.findByIdAndUpdate(purchaseId, { status: 'failed' });

      break;
    }
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
};
