import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import $ from 'jquery';
import 'core-js'
import jQuery from 'jquery';
window.jQuery = jQuery;

//import { BrowserRouter as Router } from 'react-router-dom';

import App from './App'
import store from './store'

createRoot(document.getElementById('root')).render(
  
    <Provider store={store}>
     
        <App />
     

  </Provider>


  ,
)
