import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// Add JWT automatically to protected requests
api.interceptors.request.use(
    (config) => {

        // Authentication endpoints are public
        const isAuthRequest =
            config.url?.startsWith("/auth/");

        if (!isAuthRequest) {

            const token =
                localStorage.getItem("token");

            if (token) {

                config.headers.Authorization =
                    `Bearer ${token}`;

            }
        }

        return config;
    },

    (error) => {
        return Promise.reject(error);
    }
);


// Handle unauthorized requests
api.interceptors.response.use(

    (response) => response,

    (error) => {

        if (error.response?.status === 401) {

            localStorage.removeItem("token");
            localStorage.removeItem("email");
            localStorage.removeItem("role");

            // Only redirect if the user is not already
            // on the login/register page
            if (
                window.location.pathname !== "/login" &&
                window.location.pathname !== "/register"
            ) {
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default api;