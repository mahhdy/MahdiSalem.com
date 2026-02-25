import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ContentBrowser from './pages/ContentBrowser';
import ContentEditor from './pages/ContentEditor';
import CategoryManager from './pages/CategoryManager';
import TagManager from './pages/TagManager';
import I18nManager from './pages/I18nManager';
import MediaManager from './pages/MediaManager';
import ScriptRunner from './pages/ScriptRunner';
import Guides from './pages/Guides';
import SiteConfigManager from './pages/SiteConfigManager';
import PublishQueue from './pages/PublishQueue';
import Backups from './pages/Backups';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/publish-queue" element={<PublishQueue />} />
                <Route path="/content" element={<ContentBrowser />} />
                <Route path="/content/:collection/*" element={<ContentEditor />} />
                <Route path="/categories" element={<CategoryManager />} />
                <Route path="/tags" element={<TagManager />} />
                <Route path="/i18n" element={<I18nManager />} />
                <Route path="/media" element={<MediaManager />} />
                <Route path="/scripts" element={<ScriptRunner />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/site-config" element={<SiteConfigManager />} />
                <Route path="/backups" element={<Backups />} />
            </Route>
        </Routes>
    );
}
