// import { configureStore } from '@reduxjs/toolkit';
// import rootReducer from './reducers';

// const store = configureStore({
//   reducer: rootReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({ serializableCheck: false }),
// });

// export default store;

// export type AppDispatch = typeof store.dispatch;
// export type RootState = ReturnType<typeof rootReducer>;
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './reducers';
// import storage from 'redux-persist/lib/storage';
// import { persistReducer, persistStore } from 'redux-persist';

// Configuration for redux-persist
// const persistConfig = {
//   key: 'root',
//   storage,
//   blacklist: ['message', 'event', 'chat'],
// };

// const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
});

// const persistor = persistStore(store);

export { store };

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof rootReducer>;
