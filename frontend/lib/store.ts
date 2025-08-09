import { configureStore } from '@reduxjs/toolkit';
import walletReducer from './slices/walletSlice';
import subnetReducer from './slices/subnetSlice';
import monitoringReducer from './slices/monitoringSlice';
import templateReducer from './slices/templateSlice';

export const store = configureStore({
  reducer: {
    wallet: walletReducer,
    subnet: subnetReducer,
    monitoring: monitoringReducer,
    templates: templateReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['wallet/setProvider', 'wallet/setSigner'],
        ignoredPaths: ['wallet.provider', 'wallet.signer'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
