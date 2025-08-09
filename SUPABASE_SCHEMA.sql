-- Subnet Studio - Complete Database Schema
-- Run this in your Supabase SQL Editor

-- 1. Custom Types
CREATE TYPE public.user_role AS ENUM ('admin', 'user', 'developer');
CREATE TYPE public.subnet_status AS ENUM ('draft', 'deploying', 'active', 'failed', 'paused');
CREATE TYPE public.vm_type AS ENUM ('evm', 'spacesvm', 'customvm', 'subnet_evm');
CREATE TYPE public.network_type AS ENUM ('fuji', 'mainnet', 'local');
CREATE TYPE public.deployment_status AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'cancelled');
CREATE TYPE public.template_visibility AS ENUM ('private', 'public', 'shared');
CREATE TYPE public.monitoring_status AS ENUM ('healthy', 'warning', 'error', 'offline');

-- 2. Core Tables

-- User profiles table (references auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role,
    wallet_address TEXT UNIQUE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Subnet configurations
CREATE TABLE public.subnet_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    vm_type public.vm_type NOT NULL DEFAULT 'evm'::public.vm_type,
    status public.subnet_status DEFAULT 'draft'::public.subnet_status,
    network public.network_type DEFAULT 'fuji'::public.network_type,
    
    -- Tokenomics configuration
    initial_supply BIGINT DEFAULT 1000000000,
    gas_price BIGINT DEFAULT 225000000000,
    
    -- Governance settings
    governance_threshold DECIMAL(5,2) DEFAULT 51.00,
    voting_period_hours INTEGER DEFAULT 168,
    
    -- Technical configuration
    config_json JSONB NOT NULL DEFAULT '{}',
    subnet_id TEXT UNIQUE,
    blockchain_id TEXT,
    rpc_endpoint TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Validator configurations
CREATE TABLE public.validators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subnet_config_id UUID NOT NULL REFERENCES public.subnet_configs(id) ON DELETE CASCADE,
    node_id TEXT NOT NULL,
    name TEXT NOT NULL,
    stake_amount BIGINT NOT NULL,
    weight INTEGER DEFAULT 1,
    is_primary BOOLEAN DEFAULT false,
    endpoint TEXT,
    status public.monitoring_status DEFAULT 'offline'::public.monitoring_status,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Deployment history
CREATE TABLE public.deployments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subnet_config_id UUID NOT NULL REFERENCES public.subnet_configs(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    network public.network_type NOT NULL,
    status public.deployment_status DEFAULT 'pending'::public.deployment_status,
    
    -- Deployment details
    deployment_logs TEXT,
    error_message TEXT,
    gas_used BIGINT,
    transaction_hash TEXT,
    block_number BIGINT,
    
    -- Timing
    started_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Subnet templates
CREATE TABLE public.subnet_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'general',
    visibility public.template_visibility DEFAULT 'private'::public.template_visibility,
    
    -- Template configuration
    template_config JSONB NOT NULL DEFAULT '{}',
    vm_type public.vm_type NOT NULL DEFAULT 'evm'::public.vm_type,
    
    -- Usage statistics
    usage_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.00,
    
    -- Tags for searchability
    tags TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Template usage tracking
CREATE TABLE public.template_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES public.subnet_templates(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subnet_config_id UUID REFERENCES public.subnet_configs(id) ON DELETE SET NULL,
    rating DECIMAL(3,2) NULL,
    used_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Monitoring metrics
CREATE TABLE public.monitoring_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subnet_config_id UUID NOT NULL REFERENCES public.subnet_configs(id) ON DELETE CASCADE,
    
    -- Block information
    current_block_height BIGINT DEFAULT 0,
    block_time_avg DECIMAL(8,2), -- Average block time in seconds
    
    -- Performance metrics
    tps DECIMAL(10,2) DEFAULT 0.00, -- Transactions per second
    active_validators INTEGER DEFAULT 0,
    total_validators INTEGER DEFAULT 0,
    
    -- Network health
    health_status public.monitoring_status DEFAULT 'healthy'::public.monitoring_status,
    uptime_percentage DECIMAL(5,2) DEFAULT 100.00,
    
    -- Resource usage
    memory_usage_mb INTEGER DEFAULT 0,
    disk_usage_gb DECIMAL(8,2) DEFAULT 0.00,
    network_io_mb DECIMAL(10,2) DEFAULT 0.00,
    
    -- Timestamps
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Activity logs for audit trail
CREATE TABLE public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    subnet_config_id UUID REFERENCES public.subnet_configs(id) ON DELETE SET NULL,
    
    action TEXT NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- User settings and preferences
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    
    -- Notification preferences
    email_notifications BOOLEAN DEFAULT true,
    deployment_alerts BOOLEAN DEFAULT true,
    monitoring_alerts BOOLEAN DEFAULT true,
    
    -- UI preferences
    theme TEXT DEFAULT 'dark',
    dashboard_layout JSONB DEFAULT '{}',
    
    -- API preferences
    api_rate_limit INTEGER DEFAULT 1000,
    webhook_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id)
);

-- 3. Indexes for performance
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_wallet ON public.user_profiles(wallet_address);
CREATE INDEX idx_subnet_configs_user_id ON public.subnet_configs(user_id);
CREATE INDEX idx_subnet_configs_status ON public.subnet_configs(status);
CREATE INDEX idx_subnet_configs_network ON public.subnet_configs(network);
CREATE INDEX idx_validators_subnet_id ON public.validators(subnet_config_id);
CREATE INDEX idx_validators_status ON public.validators(status);
CREATE INDEX idx_deployments_user_id ON public.deployments(user_id);
CREATE INDEX idx_deployments_status ON public.deployments(status);
CREATE INDEX idx_deployments_subnet_id ON public.deployments(subnet_config_id);
CREATE INDEX idx_templates_user_id ON public.subnet_templates(user_id);
CREATE INDEX idx_templates_visibility ON public.subnet_templates(visibility);
CREATE INDEX idx_templates_category ON public.subnet_templates(category);
CREATE INDEX idx_template_usage_template_id ON public.template_usage(template_id);
CREATE INDEX idx_template_usage_user_id ON public.template_usage(user_id);
CREATE INDEX idx_monitoring_subnet_id ON public.monitoring_metrics(subnet_config_id);
CREATE INDEX idx_monitoring_recorded_at ON public.monitoring_metrics(recorded_at);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at);
CREATE INDEX idx_user_settings_user_id ON public.user_settings(user_id);

-- 4. RLS Setup
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subnet_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subnet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monitoring_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies (Using Pattern 1 for user_profiles, Pattern 2 for others)

-- Pattern 1: Core user table - simple policies only
CREATE POLICY "users_manage_own_user_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Pattern 2: Simple user ownership
CREATE POLICY "users_manage_own_subnet_configs"
ON public.subnet_configs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_deployments"
ON public.deployments
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_activity_logs"
ON public.activity_logs
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_user_settings"
ON public.user_settings
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "users_manage_own_template_usage"
ON public.template_usage
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pattern 7: Complex relationships for validators (through subnet ownership)
CREATE OR REPLACE FUNCTION public.can_access_validator(validator_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.subnet_configs sc
    WHERE sc.id = (
        SELECT subnet_config_id FROM public.validators WHERE id = validator_uuid LIMIT 1
    )
    AND sc.user_id = auth.uid()
)
$$;

CREATE POLICY "users_manage_subnet_validators"
ON public.validators
FOR ALL
TO authenticated
USING (public.can_access_validator(id))
WITH CHECK (public.can_access_validator(id));

-- Pattern 7: Complex relationships for monitoring (through subnet ownership)
CREATE OR REPLACE FUNCTION public.can_access_monitoring(metric_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT EXISTS (
    SELECT 1 FROM public.subnet_configs sc
    WHERE sc.id = (
        SELECT subnet_config_id FROM public.monitoring_metrics WHERE id = metric_uuid LIMIT 1
    )
    AND sc.user_id = auth.uid()
)
$$;

CREATE POLICY "users_access_subnet_monitoring"
ON public.monitoring_metrics
FOR ALL
TO authenticated
USING (public.can_access_monitoring(id))
WITH CHECK (public.can_access_monitoring(id));

-- Pattern 4: Public read, private write for templates
CREATE POLICY "public_can_read_public_templates"
ON public.subnet_templates
FOR SELECT
TO public
USING (visibility = 'public'::public.template_visibility);

CREATE POLICY "users_manage_own_templates"
ON public.subnet_templates
FOR ALL
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 6. Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')::public.user_role
  );
  
  -- Create default user settings
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Utility functions for template management
CREATE OR REPLACE FUNCTION public.update_template_usage(template_uuid UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subnet_templates 
  SET usage_count = usage_count + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = template_uuid;
END;
$$;

-- Function to calculate template rating
CREATE OR REPLACE FUNCTION public.calculate_template_rating(template_uuid UUID)
RETURNS DECIMAL(3,2)
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
SELECT COALESCE(AVG(rating), 0.00) 
FROM public.template_usage tu
WHERE tu.template_id = template_uuid
$$;

-- Function to update subnet status
CREATE OR REPLACE FUNCTION public.update_subnet_status(subnet_uuid UUID, new_status public.subnet_status)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.subnet_configs 
  SET status = new_status,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = subnet_uuid AND user_id = auth.uid();
  
  -- Log the activity
  INSERT INTO public.activity_logs (user_id, subnet_config_id, action, description)
  VALUES (
    auth.uid(),
    subnet_uuid,
    'status_change',
    'Subnet status changed to ' || new_status::TEXT
  );
END;
$$;

-- 8. Mock Data for Development (Optional - Remove for production)
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
    user_uuid UUID := gen_random_uuid();
    subnet_uuid UUID := gen_random_uuid();
    template_uuid UUID := gen_random_uuid();
    deployment_uuid UUID := gen_random_uuid();
BEGIN
    -- Create auth users with required fields
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES
        (admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'admin@subnetstudio.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Subnet Admin", "role": "admin"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null),
        (user_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
         'developer@subnetstudio.com', crypt('dev123', gen_salt('bf', 10)), now(), now(), now(),
         '{"full_name": "Jane Developer", "role": "developer"}'::jsonb, '{"provider": "email", "providers": ["email"]}'::jsonb,
         false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null);

    -- Create sample subnet configuration
    INSERT INTO public.subnet_configs (id, user_id, name, description, vm_type, status, network, config_json) VALUES
        (subnet_uuid, admin_uuid, 'DeFi Gaming Subnet', 'High-performance subnet optimized for DeFi gaming applications', 'evm'::public.vm_type, 'active'::public.subnet_status, 'fuji'::public.network_type, 
         '{"chainId": 43113, "blockTime": 2, "validators": 5, "customSettings": {"txPoolSize": 4096, "blockGasLimit": "8000000"}}'::jsonb);

    -- Create sample validators
    INSERT INTO public.validators (subnet_config_id, node_id, name, stake_amount, weight, is_primary, status) VALUES
        (subnet_uuid, 'NodeID-P7oB2McjBGgW2NXXWVYjV8JEDFoW9xDE5', 'Primary Validator', 2000000000000000000, 1, true, 'healthy'::public.monitoring_status),
        (subnet_uuid, 'NodeID-GWNhYmRBBabyNVKKEuR2M4K4p2o6TS4K2', 'Validator Node 2', 1000000000000000000, 1, false, 'healthy'::public.monitoring_status),
        (subnet_uuid, 'NodeID-NFBbbJ4qCmNaCzeW7sxErhvWqvEQMnYcN', 'Validator Node 3', 1000000000000000000, 1, false, 'warning'::public.monitoring_status);

    -- Create sample template
    INSERT INTO public.subnet_templates (id, user_id, name, description, category, visibility, template_config, vm_type, tags) VALUES
        (template_uuid, admin_uuid, 'DeFi Starter Template', 'Pre-configured subnet template for DeFi applications with optimized gas settings', 'defi', 'public'::public.template_visibility,
         '{"vm_type": "evm", "gas_price": 225000000000, "initial_supply": 1000000000, "governance": {"threshold": 51, "votingPeriod": 168}}'::jsonb,
         'evm'::public.vm_type, ARRAY['defi', 'evm', 'starter']);

    -- Create sample deployment
    INSERT INTO public.deployments (id, subnet_config_id, user_id, network, status, deployment_logs, started_at) VALUES
        (deployment_uuid, subnet_uuid, admin_uuid, 'fuji'::public.network_type, 'completed'::public.deployment_status, 
         'Subnet deployment initiated... Validators configured... Deployment successful!', now() - interval '1 hour');

    -- Create sample monitoring data
    INSERT INTO public.monitoring_metrics (subnet_config_id, current_block_height, tps, active_validators, total_validators, health_status) VALUES
        (subnet_uuid, 15234, 45.67, 3, 3, 'healthy'::public.monitoring_status);

    -- Create sample activity logs
    INSERT INTO public.activity_logs (user_id, subnet_config_id, action, description) VALUES
        (admin_uuid, subnet_uuid, 'subnet_created', 'Created new DeFi Gaming Subnet'),
        (admin_uuid, subnet_uuid, 'deployment_started', 'Started deployment to Fuji testnet'),
        (admin_uuid, subnet_uuid, 'deployment_completed', 'Successfully deployed subnet to Fuji testnet');

EXCEPTION
    WHEN foreign_key_violation THEN
        RAISE NOTICE 'Foreign key error: %', SQLERRM;
    WHEN unique_violation THEN
        RAISE NOTICE 'Unique constraint error: %', SQLERRM;
    WHEN OTHERS THEN
        RAISE NOTICE 'Unexpected error: %', SQLERRM;
END $$;

-- Success message
SELECT 'Database schema created successfully! 🎉' as message;
