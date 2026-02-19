import { NavLink } from 'react-router-dom';

const navItems = [
    { section: 'Overview' },
    { path: '/', label: 'Dashboard', icon: '📊' },
    { section: 'Content' },
    { path: '/content', label: 'Content Browser', icon: '📝' },
    { path: '/categories', label: 'Categories', icon: '🏷️' },
    { path: '/tags', label: 'Tags', icon: '🔖' },
    { section: 'Tools' },
    { path: '/i18n', label: 'Translations', icon: '🌐' },
    { path: '/media', label: 'Media', icon: '🖼️' },
    { path: '/scripts', label: 'Scripts', icon: '⚙️' },
];

export default function Sidebar() {
    return (
        <aside className="admin-sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <div className="logo-icon">M</div>
                    <span>MahdiSalem</span>
                </div>
                <div className="sidebar-subtitle">Admin Panel</div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, i) => {
                    if ('section' in item && !('path' in item)) {
                        return (
                            <div key={i} className="nav-section-label">
                                {item.section}
                            </div>
                        );
                    }
                    if ('path' in item) {
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path!}
                                end={item.path === '/'}
                                className={({ isActive }) =>
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="nav-icon">{item.icon}</span>
                                <span>{item.label}</span>
                            </NavLink>
                        );
                    }
                    return null;
                })}
            </nav>

            <div className="sidebar-footer">
                local-only · localhost:3333
            </div>
        </aside>
    );
}
