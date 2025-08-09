import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Validator {
  nodeID: string;
  weight: string;
  startTime: string;
  endTime: string;
  uptime: string;
}

export interface SubnetMetrics {
  blockHeight: number;
  tps: number;
  validators: Validator[];
  health: 'green' | 'yellow' | 'red';
  lastUpdate: string;
}

export interface MonitoringState {
  subnetId: string | null;
  metrics: SubnetMetrics | null;
  logs: string[];
  isMonitoring: boolean;
  error: string | null;
}

const initialState: MonitoringState = {
  subnetId: null,
  metrics: null,
  logs: [],
  isMonitoring: false,
  error: null,
};

export const startMonitoring = createAsyncThunk(
  'monitoring/start',
  async (subnetId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitor/${subnetId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to start monitoring');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMetrics = createAsyncThunk(
  'monitoring/fetchMetrics',
  async (subnetId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/monitor/${subnetId}/metrics`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch metrics');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const monitoringSlice = createSlice({
  name: 'monitoring',
  initialState,
  reducers: {
    setSubnetId: (state, action: PayloadAction<string>) => {
      state.subnetId = action.payload;
    },
    addLog: (state, action: PayloadAction<string>) => {
      state.logs.push(action.payload);
      // Keep only last 100 logs
      if (state.logs.length > 100) {
        state.logs = state.logs.slice(-100);
      }
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    updateMetrics: (state, action: PayloadAction<SubnetMetrics>) => {
      state.metrics = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startMonitoring.pending, (state) => {
        state.isMonitoring = true;
        state.error = null;
      })
      .addCase(startMonitoring.fulfilled, (state, action) => {
        state.isMonitoring = true;
        state.metrics = action.payload;
        state.error = null;
      })
      .addCase(startMonitoring.rejected, (state, action) => {
        state.isMonitoring = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMetrics.fulfilled, (state, action) => {
        state.metrics = action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSubnetId,
  addLog,
  clearLogs,
  updateMetrics,
  clearError,
} = monitoringSlice.actions;

export default monitoringSlice.reducer;
