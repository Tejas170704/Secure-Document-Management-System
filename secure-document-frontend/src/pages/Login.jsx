import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const response = await api.post("/auth/login", {
                email: email,
                password: password
            });

            console.log("Login response:", response.data);

            // Save JWT
            localStorage.setItem(
                "token",
                response.data.token
            );

            // Save user email
            if (response.data.email) {
                localStorage.setItem(
                    "email",
                    response.data.email
                );
            }

            // Save user role
            if (response.data.role) {
                localStorage.setItem(
                    "role",
                    response.data.role
                );
            }

            // Redirect based on role
            if (response.data.role === "ADMIN") {

                navigate("/admin");

            } else {

                navigate("/dashboard");

            }

        } catch (error) {

            console.error("Login failed:", error);

            setError(
                error.response?.data?.message ||
                "Invalid email or password"
            );

        } finally {

            setLoading(false);
        }
    };

    return (
        <div>

            <h1>Secure Document Management System</h1>

            <h2>Login</h2>

            <form onSubmit={handleLogin}>

                <div>

                    <label>Email</label>

                    <br />

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="Enter email"
                        required
                    />

                </div>

                <br />

                <div>

                    <label>Password</label>

                    <br />

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="Enter password"
                        required
                    />

                </div>

                <br />

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>

            </form>

            {error && (
                <p style={{ color: "red" }}>
                    {error}
                </p>
            )}

        </div>
    );
}

export default Login;