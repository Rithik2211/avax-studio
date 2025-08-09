const express = require('express');
const router = express.Router();
const databaseService = require('../services/databaseService');

/**
 * GET /templates - Get all public templates
 */
router.get('/', async (req, res) => {
  try {
    const { category, vmType, search } = req.query;
    
    let templates = [];
    
    if (search) {
      // Search templates
      templates = await databaseService.searchTemplates(search, category, vmType);
    } else {
      // Get templates by visibility
      templates = await databaseService.getTemplates('public', category);
    }

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

/**
 * GET /templates/user/:userId - Get user's templates
 */
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const templates = await databaseService.getUserTemplates(userId);

    res.json({
      success: true,
      templates
    });
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({
      error: 'Failed to fetch user templates',
      message: error.message
    });
  }
});

/**
 * GET /templates/:id - Get specific template
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const template = await databaseService.getTemplate(id);

    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      error: 'Failed to fetch template',
      message: error.message
    });
  }
});

/**
 * POST /templates - Create new template
 */
router.post('/', async (req, res) => {
  try {
    const { userId, name, description, category, visibility, config, vmType, tags } = req.body;

    if (!userId || !name || !config) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userId, name, and config are required'
      });
    }

    const template = await databaseService.createTemplate(userId, {
      name,
      description,
      category,
      visibility,
      config,
      vmType,
      tags
    });

    // Log activity
    try {
      await databaseService.logActivity(userId, 'template_created', 
        `Created template: ${name}`, 
        { templateId: template.id, category, visibility }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      template
    });
  } catch (error) {
    console.error('Error creating template:', error);
    res.status(500).json({
      error: 'Failed to create template',
      message: error.message
    });
  }
});

/**
 * PUT /templates/:id - Update template
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, updates } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide userId'
      });
    }

    // Get the template to verify ownership
    const template = await databaseService.getTemplate(id);
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }

    if (template.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own templates'
      });
    }

    // Update template
    const updatedTemplate = await databaseService.updateTemplate(id, updates);

    // Log activity
    try {
      await databaseService.logActivity(userId, 'template_updated', 
        `Updated template: ${template.name}`, 
        { templateId: id, updates }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      error: 'Failed to update template',
      message: error.message
    });
  }
});

/**
 * DELETE /templates/:id - Delete template
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide userId'
      });
    }

    // Get the template to verify ownership
    const template = await databaseService.getTemplate(id);
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }

    if (template.user_id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own templates'
      });
    }

    // Delete template
    await databaseService.deleteTemplate(id);

    // Log activity
    try {
      await databaseService.logActivity(userId, 'template_deleted', 
        `Deleted template: ${template.name}`, 
        { templateId: id }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      message: 'Template deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      error: 'Failed to delete template',
      message: error.message
    });
  }
});

/**
 * POST /templates/:id/use - Use a template
 */
router.post('/:id/use', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, subnetConfigId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID required',
        message: 'Please provide userId'
      });
    }

    // Get the template
    const template = await databaseService.getTemplate(id);
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }

    // Record template usage
    await databaseService.updateTemplateUsage(id, userId, subnetConfigId);

    // Log activity
    try {
      await databaseService.logActivity(userId, 'template_used', 
        `Used template: ${template.name}`, 
        { templateId: id, subnetConfigId }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      template: template.template_config,
      message: 'Template loaded successfully'
    });
  } catch (error) {
    console.error('Error using template:', error);
    res.status(500).json({
      error: 'Failed to use template',
      message: error.message
    });
  }
});

/**
 * POST /templates/:id/rate - Rate a template
 */
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating } = req.body;

    if (!userId || !rating) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'userId and rating are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }

    // Update template usage with rating
    await databaseService.updateTemplateRating(id, userId, rating);

    // Log activity
    try {
      await databaseService.logActivity(userId, 'template_rated', 
        `Rated template with ${rating} stars`, 
        { templateId: id, rating }
      );
    } catch (logError) {
      console.warn('Failed to log activity:', logError);
    }

    res.json({
      success: true,
      message: 'Rating submitted successfully'
    });
  } catch (error) {
    console.error('Error rating template:', error);
    res.status(500).json({
      error: 'Failed to rate template',
      message: error.message
    });
  }
});

/**
 * GET /templates/stats - Get template statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await databaseService.getTemplateStats();

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching template stats:', error);
    res.status(500).json({
      error: 'Failed to fetch template statistics',
      message: error.message
    });
  }
});

/**
 * GET /templates/search - Search templates
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category, vmType } = req.query;

    if (!q) {
      return res.status(400).json({
        error: 'Search query required',
        message: 'Please provide a search query (q parameter)'
      });
    }

    const templates = await databaseService.searchTemplates(q, category, vmType);

    res.json({
      success: true,
      templates,
      query: q,
      filters: { category, vmType }
    });
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({
      error: 'Failed to search templates',
      message: error.message
    });
  }
});

module.exports = router;
