import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
BrowserRouter,
Navigate,
Route,
Routes,
} from "react-router-dom";

import "./index.css";

import App from "./App.tsx";
import { AuthPage } from "./components/AuthPage";
import { AuthCallback } from "./components/AuthCallback";
import { DashboardPage } from "./components/DashboardPage";
import { PreviewPage } from "./components/PreviewPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { previewIdFromLocation } from "./lib/previewStore";

function Root() {
const previewId = previewIdFromLocation();

// Preserve the existing public preview URL behavior.
if (previewId) {
return <PreviewPage id={previewId} />;
}

return ( <BrowserRouter> <Routes>
<Route path="/" element={<App />} />

```
    <Route path="/login" element={<AuthPage />} />

    <Route path="/auth/callback" element={<AuthCallback />} />

    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      }
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</BrowserRouter>

);
}

createRoot(document.getElementById("root")!).render( <StrictMode> <Root /> </StrictMode>
);
