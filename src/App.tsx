import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { routes } from './routes/routes';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {routes.map((route) => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
      </Route>
    </Routes>
  );
}

export default App;
