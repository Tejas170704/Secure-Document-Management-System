import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import authService from "../services/authService";

function Login() {

    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);


    const handleChange = (event) => {

        setFormData({
            ...formData,
            [event.target.name]: event.target.value,
        });

    };


    const handleSubmit = async (event) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {

            const data = await authService.login(formData);

            console.log("Login response:", data);

            // Validate token
            if (!data?.token) {

                setError(
                    "Login failed: authentication token was not received."
                );

                return;
            }


            // Store authentication information
            localStorage.setItem(
                "token",
                data.token
            );

            localStorage.setItem(
                "email",
                data.email
            );

            localStorage.setItem(
                "role",
                data.role
            );


            console.log(
                "Login successful"
            );

            console.log(
                "Email:",
                data.email
            );

            console.log(
                "Role:",
                data.role
            );


            // Redirect according to role
            if (data.role === "ADMIN") {

                navigate("/admin");

            } else {

                navigate("/dashboard");

            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );


            if (error.response?.status === 401) {

                setError(
                    "Invalid email or password."
                );

            } else if (error.response?.data?.message) {

                setError(
                    error.response.data.message
                );

            } else {

                setError(
                    "Unable to login. Please check the backend."
                );

            }

        } finally {

            setLoading(false);

        }
    };


    return (

        <div className="auth-container">

            <div className="auth-card">

                <h1>
                    Secure Document Management
                </h1>

                <h2>
                    Login
                </h2>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                <form onSubmit={handleSubmit}>

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter email"
                        required
                    />


                    <label>
                        Password
                    </label>

                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        required
                    />


                    <button
                        type="submit"
                        disabled={loading}
                    >

                        {loading
                            ? "Logging in..."
                            : "Login"}

                    </button>

                </form>


                <p>
                    Don't have an account?{" "}

                    <Link to="/register">
                        Register
                    </Link>
                </p>

            </div>

        </div>
    );
}

export default Login;