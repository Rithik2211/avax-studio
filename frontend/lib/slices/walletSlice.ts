import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// Type for the Ethereum provider
interface EthereumProvider {
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, handler: (...args: any[]) => void) => void;
  removeListener: (eventName: string, handler: (...args: any[]) => void) => void;
}

export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: any | null;
  signer: any | null;
  chainId: number | null;
  balance: string | null;
  isConnecting: boolean;
  error: string | null;
}

const initialState: WalletState = {
  isConnected: false,
  address: null,
  provider: null,
  signer: null,
  chainId: null,
  balance: null,
  isConnecting: false,
  error: null,
};

export const connectWallet = createAsyncThunk(
  'wallet/connect',
  async (_, { rejectWithValue }) => {
    try {
      const provider = await detectEthereumProvider() as EthereumProvider;
      
      if (!provider) {
        throw new Error('MetaMask not found! Please install MetaMask.');
      }

      // Request account access
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const account = accounts[0];

      // Create ethers provider and signer
      const ethersProvider = new ethers.BrowserProvider(provider);
      const signer = await ethersProvider.getSigner();

      // Get network info
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(account);

      // Create or get user profile in database
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress: account,
            email: `${account.slice(0, 8)}@demo.avaxstudio.com`, // Demo email
            fullName: `User ${account.slice(0, 6)}...${account.slice(-4)}`
          }),
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('User profile created/retrieved:', userData);
        }
      } catch (dbError) {
        console.warn('Failed to create user profile:', dbError);
        // Continue without user profile for demo
      }

      return {
        address: account,
        provider: ethersProvider,
        signer,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const disconnectWallet = createAsyncThunk(
  'wallet/disconnect',
  async () => {
    // Clean up wallet connection
    return null;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setProvider: (state, action: PayloadAction<any>) => {
      state.provider = action.payload;
    },
    setSigner: (state, action: PayloadAction<any>) => {
      state.signer = action.payload;
    },
    updateBalance: (state, action: PayloadAction<string>) => {
      state.balance = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => {
        state.isConnecting = true;
        state.error = null;
      })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.isConnected = true;
        state.isConnecting = false;
        state.address = action.payload.address;
        state.provider = action.payload.provider;
        state.signer = action.payload.signer;
        state.chainId = action.payload.chainId;
        state.balance = action.payload.balance;
        state.error = null;
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.isConnected = false;
        state.isConnecting = false;
        state.error = action.payload as string;
      })
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.isConnected = false;
        state.address = null;
        state.provider = null;
        state.signer = null;
        state.chainId = null;
        state.balance = null;
        state.error = null;
      });
  },
});

export const { setProvider, setSigner, updateBalance, clearError } = walletSlice.actions;
export default walletSlice.reducer;
