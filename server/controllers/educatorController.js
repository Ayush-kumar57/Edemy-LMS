import { clerkClient,getAuth } from '@clerk/express';

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
