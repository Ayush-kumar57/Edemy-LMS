import { clerkClient } from '@clerk/express';
// Middleware ( Protect Educator Routes )

export const protectEducator = async (req, res, next) => {
  try {
     const { userId } = req.auth();
 
    console.log('userId:', userId);
   

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const response = await clerkClient.users.getUser(userId);

    if (response.publicMetadata.role !== 'educator') {
      return res.status(403).json({
        success: false,
        message: 'Access Denied. You are not an educator',
      });
    }
    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error in authMiddleware.js: ${error.message}`,
    });
  }
};
