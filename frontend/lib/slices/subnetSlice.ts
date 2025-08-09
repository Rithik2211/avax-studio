import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Node, Edge } from 'reactflow';

export interface SubnetConfig {
  id: string;
  name: string;
  vmType: 'EVM' | 'SpacesVM' | 'CustomVM';
  validators: string[];
  tokenomics: {
    supply: string;
    gasPrice: string;
    gasLimit: string;
  };
  governance: {
    enabled: boolean;
    threshold: number;
    validators: string[];
  };
  network: 'fuji' | 'mainnet';
}

export interface SubnetState {
  nodes: Node[];
  edges: Edge[];
  selectedNode: Node | null;
  config: SubnetConfig;
  isDeploying: boolean;
  deploymentStatus: 'idle' | 'deploying' | 'success' | 'error';
  deploymentResult: any | null;
  error: string | null;
}

const initialConfig: SubnetConfig = {
  id: '',
  name: 'MySubnet',
  vmType: 'EVM',
  validators: [],
  tokenomics: {
    supply: '1000000000',
    gasPrice: '25000000000',
    gasLimit: '8000000',
  },
  governance: {
    enabled: false,
    threshold: 2,
    validators: [],
  },
  network: 'fuji',
};

const initialState: SubnetState = {
  nodes: [],
  edges: [],
  selectedNode: null,
  config: initialConfig,
  isDeploying: false,
  deploymentStatus: 'idle',
  deploymentResult: null,
  error: null,
};

export const deploySubnet = createAsyncThunk(
  'subnet/deploy',
  async (config: SubnetConfig, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/deploy`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Deployment failed');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const subnetSlice = createSlice({
  name: 'subnet',
  initialState,
  reducers: {
    setNodes: (state, action: PayloadAction<Node[]>) => {
      state.nodes = action.payload;
    },
    setEdges: (state, action: PayloadAction<Edge[]>) => {
      state.edges = action.payload;
    },
    addNode: (state, action: PayloadAction<Node>) => {
      state.nodes.push(action.payload);
    },
    updateNode: (state, action: PayloadAction<{ id: string; data: any }>) => {
      const nodeIndex = state.nodes.findIndex(node => node.id === action.payload.id);
      if (nodeIndex !== -1) {
        state.nodes[nodeIndex].data = { ...state.nodes[nodeIndex].data, ...action.payload.data };
      }
    },
    removeNode: (state, action: PayloadAction<string>) => {
      state.nodes = state.nodes.filter(node => node.id !== action.payload);
      state.edges = state.edges.filter(edge => 
        edge.source !== action.payload && edge.target !== action.payload
      );
    },
    setSelectedNode: (state, action: PayloadAction<Node | null>) => {
      state.selectedNode = action.payload;
    },
    updateConfig: (state, action: PayloadAction<Partial<SubnetConfig>>) => {
      state.config = { ...state.config, ...action.payload };
    },
    resetConfig: (state) => {
      state.config = initialConfig;
      state.nodes = [];
      state.edges = [];
      state.selectedNode = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(deploySubnet.pending, (state) => {
        state.isDeploying = true;
        state.deploymentStatus = 'deploying';
        state.error = null;
      })
      .addCase(deploySubnet.fulfilled, (state, action) => {
        state.isDeploying = false;
        state.deploymentStatus = 'success';
        state.deploymentResult = action.payload;
        state.error = null;
      })
      .addCase(deploySubnet.rejected, (state, action) => {
        state.isDeploying = false;
        state.deploymentStatus = 'error';
        state.error = action.payload as string;
      });
  },
});

export const {
  setNodes,
  setEdges,
  addNode,
  updateNode,
  removeNode,
  setSelectedNode,
  updateConfig,
  resetConfig,
  clearError,
} = subnetSlice.actions;

export default subnetSlice.reducer;
