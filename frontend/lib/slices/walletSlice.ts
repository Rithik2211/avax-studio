import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

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
      const provider = await detectEthereumProvider();
      
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
