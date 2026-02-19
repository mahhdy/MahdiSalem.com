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
import Cheatsheet from './pages/Cheatsheet';

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/content" element={<ContentBrowser />} />
                <Route path="/content/:collection/*" element={<ContentEditor />} />
                <Route path="/categories" element={<CategoryManager />} />
                <Route path="/tags" element={<TagManager />} />
                <Route path="/i18n" element={<I18nManager />} />
                <Route path="/media" element={<MediaManager />} />
                <Route path="/scripts" element={<ScriptRunner />} />
                <Route path="/cheatsheet" element={<Cheatsheet />} />
            </Route>
        </Routes>
    );
}
