import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SubnetConfig } from './subnetSlice';

export interface Template {
  id: string;
  user_id: string;
  name: string;
  description: string;
  category: string;
  visibility: string;
  template_config: {
    vm_type: string;
    gas_price: number;
    governance: {
      threshold: number;
      votingPeriod: number;
    };
    initial_supply: number;
  };
  vm_type: string;
  usage_count: number;
  rating: number;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_profiles?: {
    id: string;
    full_name: string;
  };
}

export interface TemplateState {
  templates: Template[];
  userTemplates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: TemplateState = {
  templates: [],
  userTemplates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,
};

export const fetchTemplates = createAsyncThunk(
  'templates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch templates');
      }

      const result = await response.json();
      return result.templates; // Backend returns { success: true, templates: [...] }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserTemplates = createAsyncThunk(
  'templates/fetchUser',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/user/${userId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch user templates');
      }

      return await response.json();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const saveTemplate = createAsyncThunk(
  'templates/save',
  async (template: Omit<Template, 'id' | 'createdAt' | 'updatedAt' | 'downloads' | 'rating'>, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(template),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save template');
      }

      const result = await response.json();
      return result.template; // Backend returns { success: true, template: {...} }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadTemplate = createAsyncThunk(
  'templates/load',
  async (templateId: string, { rejectWithValue }) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/templates/${templateId}`);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to load template');
      }

      const result = await response.json();
      return result.template; // Backend returns { success: true, template: {...} }
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const templateSlice = createSlice({
  name: 'templates',
  initialState,
  reducers: {
    setSelectedTemplate: (state, action: PayloadAction<Template | null>) => {
      state.selectedTemplate = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTemplates.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTemplates.fulfilled, (state, action) => {
        state.isLoading = false;
        state.templates = action.payload;
        state.error = null;
      })
      .addCase(fetchTemplates.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserTemplates.fulfilled, (state, action) => {
        state.userTemplates = action.payload;
      })
      .addCase(fetchUserTemplates.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(saveTemplate.fulfilled, (state, action) => {
        state.userTemplates.push(action.payload);
      })
      .addCase(saveTemplate.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      .addCase(loadTemplate.fulfilled, (state, action) => {
        state.selectedTemplate = action.payload;
      })
      .addCase(loadTemplate.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedTemplate,
  clearError,
} = templateSlice.actions;

export default templateSlice.reducer;
