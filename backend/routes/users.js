const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

/**
 * POST /users/profile - Create or get user profile
 */
router.post('/profile', async (req, res) => {
  try {
    const { walletAddress, email, fullName } = req.body;

    if (!walletAddress) {
      return res.status(400).json({
        error: 'Wallet address is required',
        message: 'Please provide a wallet address'
      });
    }

    // Check if user already exists by wallet address
    let userProfile = null;
    try {
      userProfile = await databaseService.getUserByWalletAddress(walletAddress);
    } catch (error) {
      // User doesn't exist, will create new one
    }

    if (userProfile) {
      // User exists, return existing profile
      return res.json({
        success: true,
        user: userProfile,
        message: 'User profile retrieved'
      });
    }

    // Create new user profile
    const newUser = await databaseService.createUserProfileFromWallet({
      walletAddress,
      email: email || `${walletAddress.slice(0, 8)}@demo.avaxstudio.com`,
      fullName: fullName || `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
      role: 'user'
    });

    res.json({
      success: true,
      user: newUser,
      message: 'User profile created successfully'
    });

  } catch (error) {
    console.error('User profile creation error:', error);
    res.status(500).json({
      error: 'Failed to create user profile',
      message: error.message
    });
  }
});

/**
 * GET /users/profile/:walletAddress - Get user profile by wallet address
 */
router.get('/profile/:walletAddress', async (req, res) => {
  try {
    const { walletAddress } = req.params;

    let userProfile = null;
    try {
      userProfile = await databaseService.getUserByWalletAddress(walletAddress);
    } catch (error) {
      // User doesn't exist, create a demo user profile
      console.log('User not found, creating demo profile for:', walletAddress);
      userProfile = await databaseService.createUserProfileFromWallet({
        walletAddress,
        email: `${walletAddress.slice(0, 8)}@demo.avaxstudio.com`,
        fullName: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
        role: 'user'
      });
    }

    res.json({
      success: true,
      user: userProfile
    });

  } catch (error) {
    console.error('User profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch user profile',
      message: error.message
    });
  }
});

module.exports = router;
