// import ReactDOM from 'react-dom/client';
import { render } from 'react-dom';
import { HashRouter } from 'react-router-dom';
import App from './components/App';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import './index.css';

const root = document.getElementById('root');
// const root = ReactDOM.createRoot(document.getElementById('root'));
render(
  <HashRouter>
    <App />
  </HashRouter>,
  root,
);
