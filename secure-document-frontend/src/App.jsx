import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";

function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={
                        <h1>
                            Secure Document Management System
                        </h1>
                    }
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/dashboard"
                    element={
                        <h1>
                            User Dashboard
                        </h1>
                    }
                />

                <Route
                    path="/admin"
                    element={
                        <h1>
                            Admin Dashboard
                        </h1>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;