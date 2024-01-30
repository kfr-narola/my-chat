import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import 'bootstrap/dist/js/bootstrap.bundle'
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux'
import rootReducer from './reducers/rootReducer';
import { configureStore } from '@reduxjs/toolkit';
import process from 'process';
window.process = process;

export const store = configureStore({
  reducer: rootReducer,
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Suspense fallback={()=> <p>loading....</p>}>
    <Provider store={store}>
      <App />
    </Provider>
  </Suspense>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
