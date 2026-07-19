import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import CliDocsPage from "./pages/CliDocsPage";
import PlaygroundPage from "./pages/PlaygroundPage";
import ReactDocsPage from "./pages/ReactDocsPage";

// The locale lives in an optional path prefix ("/" = en, "/ja/…" = ja).
// A single ":lang?" route (rather than nested "/ja" routes) keeps the page
// element in the same tree position for both locales, so toggling the
// language never remounts the page and playground state survives.
export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/:lang?" element={<PlaygroundPage />} />
        <Route path="/:lang?/react" element={<ReactDocsPage />} />
        <Route path="/:lang?/cli" element={<CliDocsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
