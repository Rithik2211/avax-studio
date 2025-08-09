const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

const execAsync = promisify(exec);

class AvalancheService {
  constructor() {
    this.cliPath = process.env.AVALANCHE_CLI_PATH || 'avalanche';
    this.network = process.env.AVALANCHE_NETWORK || 'fuji';
    this.configDir = process.env.AVALANCHE_CONFIG_DIR || '~/.avalanche-cli';
  }

  /**
   * Check if Avalanche CLI is installed and accessible
   */
  async checkCLI() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} --version`);
      return { installed: true, version: stdout.trim() };
    } catch (error) {
      return { installed: false, error: error.message };
    }
  }

  /**
   * Create a new private key
   */
  async createKey(keyName) {
    return new Promise((resolve, reject) => {
      const command = spawn(this.cliPath, ['key', 'create', keyName], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      command.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      command.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      command.on('close', (code) => {
        if (code === 0) {
          // Parse the output to extract addresses
          const cChainMatch = stdout.match(/C-Chain address: (0x[a-fA-F0-9]{40})/);
          const pChainMatch = stdout.match(/P-Chain address \(Fuji\): (P-fuji[a-zA-Z0-9]+)/);
          
          resolve({
            success: true,
            cChainAddress: cChainMatch ? cChainMatch[1] : null,
            pChainAddress: pChainMatch ? pChainMatch[1] : null,
            output: stdout
          });
        } else {
          reject(new Error(`Key creation failed: ${stderr}`));
        }
      });

      command.on('error', (error) => {
        reject(new Error(`Failed to execute avalanche-cli: ${error.message}`));
      });
    });
  }

  /**
   * Export a private key
   */
  async exportKey(keyName) {
    try {
      const { stdout } = await execAsync(`${this.cliPath} key export ${keyName}`);
      return { success: true, privateKey: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to export key: ${error.message}`);
    }
  }

  /**
   * List all available keys
   */
  async listKeys() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} key list`);
      return { success: true, keys: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to list keys: ${error.message}`);
    }
  }

  /**
   * Create a new subnet configuration
   */
  async createSubnet(subnetName, config) {
    return new Promise((resolve, reject) => {
      const args = ['blockchain', 'create', subnetName];
      
      // Add configuration options if provided
      if (config.vmType) {
        args.push('--vm', config.vmType);
      }
      if (config.consensus) {
        args.push('--consensus', config.consensus);
      }
      if (config.chainId) {
        args.push('--chain-id', config.chainId.toString());
      }

      const command = spawn(this.cliPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      command.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      command.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      command.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            subnetName,
            output: stdout,
            configPath: `${this.configDir}/blockchains/${subnetName}`
          });
        } else {
          reject(new Error(`Subnet creation failed: ${stderr}`));
        }
      });

      command.on('error', (error) => {
        reject(new Error(`Failed to execute avalanche-cli: ${error.message}`));
      });
    });
  }

  /**
   * Deploy a subnet to the specified network
   */
  async deploySubnet(subnetName, keyName, network = 'fuji') {
    return new Promise((resolve, reject) => {
      const command = spawn(this.cliPath, [
        'blockchain', 'deploy', subnetName,
        '--network', network,
        '--key', keyName
      ], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let deploymentData = {};

      command.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        
        // Parse deployment information
        const subnetIdMatch = output.match(/Subnet ID: ([a-zA-Z0-9]+)/);
        const blockchainIdMatch = output.match(/Blockchain ID: ([a-zA-Z0-9]+)/);
        const rpcUrlMatch = output.match(/RPC URL: (http:\/\/[^\s]+)/);
        
        if (subnetIdMatch) deploymentData.subnetId = subnetIdMatch[1];
        if (blockchainIdMatch) deploymentData.blockchainId = blockchainIdMatch[1];
        if (rpcUrlMatch) deploymentData.rpcUrl = rpcUrlMatch[1];
      });

      command.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      command.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            subnetName,
            subnetId: deploymentData.subnetId,
            blockchainId: deploymentData.blockchainId,
            rpcUrl: deploymentData.rpcUrl,
            output: stdout
          });
        } else {
          reject(new Error(`Deployment failed: ${stderr}`));
        }
      });

      command.on('error', (error) => {
        reject(new Error(`Failed to execute avalanche-cli: ${error.message}`));
      });
    });
  }

  /**
   * Get subnet information
   */
  async describeSubnet(subnetName) {
    try {
      const { stdout } = await execAsync(`${this.cliPath} blockchain describe ${subnetName}`);
      return { success: true, description: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to describe subnet: ${error.message}`);
    }
  }

  /**
   * Add a validator to a subnet
   */
  async addValidator(subnetName, validatorConfig) {
    return new Promise((resolve, reject) => {
      const args = ['validator', 'add', subnetName];
      
      if (validatorConfig.nodeId) {
        args.push('--node-id', validatorConfig.nodeId);
      }
      if (validatorConfig.stakeAmount) {
        args.push('--stake-amount', validatorConfig.stakeAmount.toString());
      }
      if (validatorConfig.key) {
        args.push('--key', validatorConfig.key);
      }

      const command = spawn(this.cliPath, args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';

      command.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      command.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      command.on('close', (code) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdout
          });
        } else {
          reject(new Error(`Validator addition failed: ${stderr}`));
        }
      });

      command.on('error', (error) => {
        reject(new Error(`Failed to execute avalanche-cli: ${error.message}`));
      });
    });
  }

  /**
   * Get network status
   */
  async getNetworkStatus() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} network status`);
      return { success: true, status: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to get network status: ${error.message}`);
    }
  }

  /**
   * Start the local network
   */
  async startNetwork() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} network start`);
      return { success: true, output: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to start network: ${error.message}`);
    }
  }

  /**
   * Stop the local network
   */
  async stopNetwork() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} network stop`);
      return { success: true, output: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to stop network: ${error.message}`);
    }
  }

  /**
   * Clean the network (remove all data)
   */
  async cleanNetwork() {
    try {
      const { stdout } = await execAsync(`${this.cliPath} network clean`);
      return { success: true, output: stdout.trim() };
    } catch (error) {
      throw new Error(`Failed to clean network: ${error.message}`);
    }
  }

  /**
   * Get subnet metrics from RPC
   */
  async getSubnetMetrics(rpcUrl) {
    try {
      // Get block height
      const blockHeightResponse = await fetch(`${rpcUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_blockNumber',
          params: [],
          id: 1
        })
      });

      const blockHeightData = await blockHeightResponse.json();
      const blockHeight = parseInt(blockHeightData.result, 16);

      // Get network info
      const networkResponse = await fetch(`${rpcUrl}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'net_version',
          params: [],
          id: 1
        })
      });

      const networkData = await networkResponse.json();
      const chainId = parseInt(networkData.result, 10);

      return {
        success: true,
        metrics: {
          blockHeight,
          chainId,
          rpcUrl,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      throw new Error(`Failed to get subnet metrics: ${error.message}`);
    }
  }

  /**
   * Validate subnet configuration
   */
  validateSubnetConfig(config) {
    const errors = [];

    if (!config.name || config.name.length < 3) {
      errors.push('Subnet name must be at least 3 characters long');
    }

    if (!config.vmType || !['evm', 'spacesvm', 'customvm', 'subnet_evm'].includes(config.vmType)) {
      errors.push('Invalid VM type. Must be one of: evm, spacesvm, customvm, subnet_evm');
    }

    if (config.chainId && (config.chainId < 1 || config.chainId > 999999)) {
      errors.push('Chain ID must be between 1 and 999999');
    }

    if (config.initialSupply && config.initialSupply < 0) {
      errors.push('Initial supply must be positive');
    }

    if (config.gasPrice && config.gasPrice < 0) {
      errors.push('Gas price must be positive');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

module.exports = new AvalancheService();
