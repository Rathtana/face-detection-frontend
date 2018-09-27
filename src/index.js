import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import Background from './components/Background/Background';
import registerServiceWorker from './registerServiceWorker';
import 'tachyons';

ReactDOM.render(<Background />, document.getElementById('background'));
ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
