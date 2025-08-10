#!/bin/bash

# Automatic subnet deployment script for local Avalanche CLI
set -e

SUBNET_NAME=$1
CHAIN_ID=${2:-43113}
PRIVATE_KEY=${3:-""}

echo "Starting automatic deployment for subnet: $SUBNET_NAME"

# Check if expect is available
if ! command -v expect &> /dev/null; then
    echo "expect not found, installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        brew install expect
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        # Linux
        sudo apt-get update && sudo apt-get install -y expect
    else
        echo "Unsupported OS. Please install expect manually."
        exit 1
    fi
fi

# Create a temporary expect script for automated interaction
cat > /tmp/avalanche_expect.exp << 'EOF'
#!/usr/bin/expect -f

set timeout 300
set subnet_name [lindex $argv 0]
set chain_id [lindex $argv 1]

spawn avalanche blockchain create $subnet_name --evm --evm-chain-id $chain_id

# Wait for first prompt and select Proof of Stake
expect "Use the arrow keys to navigate"
send "\r"

# Wait for controller prompt and select existing key
expect "Which address do you want to enable as controller"
send "\r"

# Select "Get address from an existing stored key"
expect "Use the arrow keys to navigate"
send "\r"

# Select ewoq key
expect "Use the arrow keys to navigate"
send "\r"

# Wait for genesis prompt and select defaults
expect "I want to use defaults for a test environment"
send "\r"

# Wait for completion
expect {
    "Error:" {
        puts "ERROR: Deployment failed"
        exit 1
    }
    "Subnet ID:" {
        puts "SUCCESS: Deployment completed"
        exit 0
    }
    timeout {
        puts "ERROR: Deployment timed out"
        exit 1
    }
}
EOF

chmod +x /tmp/avalanche_expect.exp

# Run the expect script
if /tmp/avalanche_expect.exp "$SUBNET_NAME" "$CHAIN_ID"; then
    echo "Deployment completed successfully"
    exit 0
else
    echo "Deployment failed"
    exit 1
fi
