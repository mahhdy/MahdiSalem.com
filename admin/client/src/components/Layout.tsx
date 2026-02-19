import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="admin-layout">
            <Sidebar />
            <main className="admin-main">
                <Outlet />
            </main>
        </div>
    );
}
