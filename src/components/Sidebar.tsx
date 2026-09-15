import { NavLink } from 'react-router-dom';
import { routes } from '../routes/routes';
import './Sidebar.scss';

function Sidebar() {
  return (
    <aside className="Sidebar">
      <nav>
        <ul>
          {routes.map((route) => (
            <li key={route.path}>
              <NavLink
                to={route.path}
                end={route.path === '/'}
                className={({ isActive }) =>
                  isActive ? 'Sidebar-link active' : 'Sidebar-link'
                }
              >
                {route.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
