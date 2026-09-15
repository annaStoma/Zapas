import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import './MainLayout.scss';

function MainLayout() {
  return (
    <div className="MainLayout">
      <Topbar />
      <div className="MainLayout-body">
        <Sidebar />
        <main className="MainLayout-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
