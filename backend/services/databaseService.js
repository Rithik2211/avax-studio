const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor() {
    this.supabase = null;
    this.initializeClient();
  }

  initializeClient() {
    if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY &&
        process.env.SUPABASE_URL !== 'your_supabase_url_here' &&
        process.env.SUPABASE_SERVICE_ROLE_KEY !== 'your_service_role_key_here') {
      this.supabase = createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
    }
  }

  /**
   * Check database connection
   */
  async checkConnection() {
    if (!this.supabase) {
      return { connected: false, error: 'Supabase not configured' };
    }

    try {
      const { data, error } = await this.supabase
        .from('user_profiles')
        .select('count')
        .limit(1);

      if (error) throw error;

      return { connected: true };
    } catch (error) {
      return { connected: false, error: error.message };
    }
  }

  /**
   * User Profile Operations
   */
  async createUserProfile(userId, profileData) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('user_profiles')
      .insert({
        id: userId,
        email: profileData.email,
        full_name: profileData.full_name,
        role: profileData.role || 'user',
        wallet_address: profileData.wallet_address
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserProfile(userId, updates) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Subnet Configuration Operations
   */
  async createSubnetConfig(userId, configData) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_configs')
      .insert({
        user_id: userId,
        name: configData.name,
        description: configData.description,
        vm_type: configData.vmType,
        status: 'draft',
        network: configData.network || 'fuji',
        initial_supply: configData.initialSupply,
        gas_price: configData.gasPrice,
        governance_threshold: configData.governanceThreshold,
        voting_period_hours: configData.votingPeriodHours,
        config_json: configData.configJson || {}
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSubnetConfigs(userId, status = null) {
    if (!this.supabase) throw new Error('Database not configured');

    let query = this.supabase
      .from('subnet_configs')
      .select('*')
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getSubnetConfig(configId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_configs')
      .select('*')
      .eq('id', configId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateSubnetConfig(configId, updates) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_configs')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', configId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteSubnetConfig(configId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { error } = await this.supabase
      .from('subnet_configs')
      .delete()
      .eq('id', configId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Deployment Operations
   */
  async createDeployment(userId, subnetConfigId, deploymentData) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('deployments')
      .insert({
        user_id: userId,
        subnet_config_id: subnetConfigId,
        network: deploymentData.network,
        status: 'pending',
        deployment_logs: deploymentData.logs || '',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDeployment(deploymentId, updates) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('deployments')
      .update({
        ...updates,
        completed_at: updates.status === 'completed' || updates.status === 'failed' 
          ? new Date().toISOString() 
          : null
      })
      .eq('id', deploymentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getDeployments(userId, status = null) {
    if (!this.supabase) throw new Error('Database not configured');

    let query = this.supabase
      .from('deployments')
      .select(`
        *,
        subnet_configs (
          id,
          name,
          vm_type,
          network
        )
      `)
      .eq('user_id', userId);

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Validator Operations
   */
  async createValidator(subnetConfigId, validatorData) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('validators')
      .insert({
        subnet_config_id: subnetConfigId,
        node_id: validatorData.nodeId,
        name: validatorData.name,
        stake_amount: validatorData.stakeAmount,
        weight: validatorData.weight || 1,
        is_primary: validatorData.isPrimary || false,
        endpoint: validatorData.endpoint,
        status: 'offline'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getValidators(subnetConfigId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('validators')
      .select('*')
      .eq('subnet_config_id', subnetConfigId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }

  async updateValidator(validatorId, updates) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('validators')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', validatorId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Template Operations
   */
  async createTemplate(userId, templateData) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_templates')
      .insert({
        user_id: userId,
        name: templateData.name,
        description: templateData.description,
        category: templateData.category || 'general',
        visibility: templateData.visibility || 'private',
        template_config: templateData.config,
        vm_type: templateData.vmType,
        tags: templateData.tags || []
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getTemplates(visibility = 'public', category = null) {
    if (!this.supabase) throw new Error('Database not configured');

    let query = this.supabase
      .from('subnet_templates')
      .select(`
        *,
        user_profiles (
          id,
          full_name
        )
      `)
      .eq('visibility', visibility);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getUserTemplates(userId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_templates')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getTemplate(templateId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_templates')
      .select(`
        *,
        user_profiles (
          id,
          full_name
        )
      `)
      .eq('id', templateId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateTemplateUsage(templateId, userId, subnetConfigId = null) {
    if (!this.supabase) throw new Error('Database not configured');

    // Record usage
    const { error: usageError } = await this.supabase
      .from('template_usage')
      .insert({
        template_id: templateId,
        user_id: userId,
        subnet_config_id: subnetConfigId
      });

    if (usageError) throw usageError;

    // Update usage count
    const { error: updateError } = await this.supabase
      .rpc('update_template_usage', { template_uuid: templateId });

    if (updateError) throw updateError;

    return { success: true };
  }

  async updateTemplateRating(templateId, userId, rating) {
    if (!this.supabase) throw new Error('Database not configured');

    // Update existing usage record with rating
    const { error } = await this.supabase
      .from('template_usage')
      .update({ rating })
      .eq('template_id', templateId)
      .eq('user_id', userId);

    if (error) throw error;

    return { success: true };
  }

  async updateTemplate(templateId, updates) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', templateId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteTemplate(templateId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { error } = await this.supabase
      .from('subnet_templates')
      .delete()
      .eq('id', templateId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Monitoring Operations
   */
  async createMonitoringMetric(subnetConfigId, metricsData) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('monitoring_metrics')
      .insert({
        subnet_config_id: subnetConfigId,
        current_block_height: metricsData.blockHeight,
        block_time_avg: metricsData.blockTimeAvg,
        tps: metricsData.tps,
        active_validators: metricsData.activeValidators,
        total_validators: metricsData.totalValidators,
        health_status: metricsData.healthStatus,
        uptime_percentage: metricsData.uptimePercentage,
        memory_usage_mb: metricsData.memoryUsage,
        disk_usage_gb: metricsData.diskUsage,
        network_io_mb: metricsData.networkIO
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getMonitoringMetrics(subnetConfigId, limit = 100) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('monitoring_metrics')
      .select('*')
      .eq('subnet_config_id', subnetConfigId)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  async getLatestMetrics(subnetConfigId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('monitoring_metrics')
      .select('*')
      .eq('subnet_config_id', subnetConfigId)
      .order('recorded_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Activity Logging
   */
  async logActivity(userId, action, description, metadata = {}, subnetConfigId = null) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        subnet_config_id: subnetConfigId,
        action,
        description,
        metadata,
        ip_address: metadata.ipAddress,
        user_agent: metadata.userAgent
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getActivityLogs(userId, limit = 50) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('activity_logs')
      .select(`
        *,
        subnet_configs (
          id,
          name
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  }

  /**
   * User Settings Operations
   */
  async getUserSettings(userId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  }

  async updateUserSettings(userId, updates) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Search and Filter Operations
   */
  async searchTemplates(query, category = null, vmType = null) {
    if (!this.supabase) throw new Error('Database not configured');

    let supabaseQuery = this.supabase
      .from('subnet_templates')
      .select(`
        *,
        user_profiles (
          id,
          full_name
        )
      `)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .eq('visibility', 'public');

    if (category) {
      supabaseQuery = supabaseQuery.eq('category', category);
    }

    if (vmType) {
      supabaseQuery = supabaseQuery.eq('vm_type', vmType);
    }

    const { data, error } = await supabaseQuery.order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Statistics and Analytics
   */
  async getSubnetStats(userId) {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_configs')
      .select('status')
      .eq('user_id', userId);

    if (error) throw error;

    const stats = {
      total: data.length,
      draft: data.filter(s => s.status === 'draft').length,
      deploying: data.filter(s => s.status === 'deploying').length,
      active: data.filter(s => s.status === 'active').length,
      failed: data.filter(s => s.status === 'failed').length
    };

    return stats;
  }

  async getTemplateStats() {
    if (!this.supabase) throw new Error('Database not configured');

    const { data, error } = await this.supabase
      .from('subnet_templates')
      .select('category, usage_count, rating')
      .eq('visibility', 'public');

    if (error) throw error;

    const stats = {
      total: data.length,
      categories: {},
      avgRating: data.reduce((sum, t) => sum + (t.rating || 0), 0) / data.length,
      totalUsage: data.reduce((sum, t) => sum + (t.usage_count || 0), 0)
    };

    data.forEach(template => {
      if (!stats.categories[template.category]) {
        stats.categories[template.category] = 0;
      }
      stats.categories[template.category]++;
    });

    return stats;
  }
}

module.exports = new DatabaseService();
