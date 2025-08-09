const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Initialize Supabase client (only if credentials are provided)
let supabase = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY && 
    process.env.SUPABASE_URL !== 'your_supabase_url_here' && 
    process.env.SUPABASE_ANON_KEY !== 'your_supabase_anon_key_here') {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
}

// GET /templates - Get all public templates
router.get('/', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }
    
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('is_public', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST205') {
        return res.json([]);
      }
      throw error;
    }
    
    res.json(templates || []);
  } catch (error) {
    console.error('Error fetching templates:', error);
    res.status(500).json({
      error: 'Failed to fetch templates',
      message: error.message
    });
  }
});

// GET /templates/user/:userId - Get user's templates
router.get('/user/:userId', async (req, res) => {
  try {
    if (!supabase) {
      return res.json([]);
    }
    
    const { userId } = req.params;
    
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('author', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      // If table doesn't exist, return empty array
      if (error.code === 'PGRST205') {
        return res.json([]);
      }
      throw error;
    }
    
    res.json(templates || []);
  } catch (error) {
    console.error('Error fetching user templates:', error);
    res.status(500).json({
      error: 'Failed to fetch user templates',
      message: error.message
    });
  }
});

// GET /templates/:id - Get specific template
router.get('/:id', async (req, res) => {
  try {
    if (!supabase) {
      return res.status(404).json({
        error: 'Database not configured',
        message: 'Supabase is not configured'
      });
    }
    
    const { id } = req.params;
    
    const { data: template, error } = await supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST205') {
        return res.status(404).json({
          error: 'Template not found',
          message: 'Database tables not set up'
        });
      }
      throw error;
    }
    
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }
    
    res.json(template);
  } catch (error) {
    console.error('Error fetching template:', error);
    res.status(500).json({
      error: 'Failed to fetch template',
      message: error.message
    });
  }
});

// POST /templates - Save new template
router.post('/', async (req, res) => {
  try {
    const {
      name,
      description,
      config,
      author,
      isPublic = false
    } = req.body;
    
    // Validate required fields
    if (!name || !config || !author) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name, config, and author are required'
      });
    }
    
    const template = {
      id: uuidv4(),
      name,
      description: description || '',
      config,
      author,
      is_public: isPublic,
      downloads: 0,
      rating: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('templates')
      .insert(template)
      .select()
      .single();
    
    if (error) throw error;
    
    res.status(201).json(data);
  } catch (error) {
    console.error('Error saving template:', error);
    res.status(500).json({
      error: 'Failed to save template',
      message: error.message
    });
  }
});

// PUT /templates/:id - Update template
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;
    delete updates.downloads;
    delete updates.rating;
    
    // Add updated timestamp
    updates.updated_at = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }
    
    res.json(data);
  } catch (error) {
    console.error('Error updating template:', error);
    res.status(500).json({
      error: 'Failed to update template',
      message: error.message
    });
  }
});

// DELETE /templates/:id - Delete template
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    
    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Error deleting template:', error);
    res.status(500).json({
      error: 'Failed to delete template',
      message: error.message
    });
  }
});

// POST /templates/:id/download - Increment download count
router.post('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('downloads')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }
    
    const { error: updateError } = await supabase
      .from('templates')
      .update({ downloads: template.downloads + 1 })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    res.json({ message: 'Download count updated' });
  } catch (error) {
    console.error('Error updating download count:', error);
    res.status(500).json({
      error: 'Failed to update download count',
      message: error.message
    });
  }
});

// POST /templates/:id/rate - Rate template
router.post('/:id/rate', async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        error: 'Invalid rating',
        message: 'Rating must be between 1 and 5'
      });
    }
    
    const { data: template, error: fetchError } = await supabase
      .from('templates')
      .select('rating, rating_count')
      .eq('id', id)
      .single();
    
    if (fetchError) throw fetchError;
    
    if (!template) {
      return res.status(404).json({
        error: 'Template not found',
        message: `Template with ID ${id} does not exist`
      });
    }
    
    // Calculate new average rating
    const currentTotal = template.rating * (template.rating_count || 0);
    const newTotal = currentTotal + rating;
    const newCount = (template.rating_count || 0) + 1;
    const newAverage = newTotal / newCount;
    
    const { error: updateError } = await supabase
      .from('templates')
      .update({ 
        rating: newAverage,
        rating_count: newCount
      })
      .eq('id', id);
    
    if (updateError) throw updateError;
    
    res.json({ 
      message: 'Rating updated',
      newRating: newAverage,
      totalRatings: newCount
    });
  } catch (error) {
    console.error('Error updating rating:', error);
    res.status(500).json({
      error: 'Failed to update rating',
      message: error.message
    });
  }
});

// GET /templates/search - Search templates
router.get('/search', async (req, res) => {
  try {
    const { q, vmType, author } = req.query;
    
    let query = supabase
      .from('templates')
      .select('*')
      .eq('is_public', true);
    
    if (q) {
      query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
    }
    
    if (vmType) {
      query = query.eq('config->>vmType', vmType);
    }
    
    if (author) {
      query = query.eq('author', author);
    }
    
    const { data: templates, error } = await query
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    res.json(templates || []);
  } catch (error) {
    console.error('Error searching templates:', error);
    res.status(500).json({
      error: 'Failed to search templates',
      message: error.message
    });
  }
});

module.exports = router;
