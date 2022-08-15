import MyButton from 'components/MyButton';
import NavBar from './NavBar';
import { TITLES } from './config';

const App = () => {
  return (
    <div className="App">
      <NavBar titles={TITLES} />
      <MyButton>Test Button</MyButton>
    </div>
  );
};

export default App;
