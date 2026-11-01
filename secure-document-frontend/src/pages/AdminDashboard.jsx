import { useEffect, useState } from "react";

import Navbar from "../components/Navbar";
import api from "../services/api";

function AdminDashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [users, setUsers] = useState([]);

    const [page, setPage] = useState(0);
    const [size] = useState(5);
    const [sortBy, setSortBy] = useState("id");

    const [totalPages, setTotalPages] = useState(0);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");


    useEffect(() => {

        loadDashboard();

    }, []);


    useEffect(() => {

        loadUsers();

    }, [page, sortBy]);


    const loadDashboard = async () => {

        try {

            const response =
                await api.get("/admin/dashboard");

            setDashboard(response.data);

        } catch (error) {

            console.error(
                "Dashboard error:",
                error
            );

            setError(
                "Unable to load admin dashboard."
            );

        }

    };


    const loadUsers = async () => {

        try {

            setLoading(true);

            const response =
                await api.get("/admin/users", {
                    params: {
                        page: page,
                        size: size,
                        sortBy: sortBy,
                    },
                });

            console.log(
                "Users:",
                response.data
            );

            setUsers(
                response.data.content || []
            );

            setTotalPages(
                response.data.totalPages || 0
            );

        } catch (error) {

            console.error(
                "Users error:",
                error
            );

            setError(
                "Unable to load users."
            );

        } finally {

            setLoading(false);

        }

    };


    const deleteUser = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this user?"
            );

        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/admin/users/${id}`
            );

            // Reload current page
            loadUsers();

            // Reload dashboard counts
            loadDashboard();

        } catch (error) {

            console.error(
                "Delete user error:",
                error
            );

            alert(
                error.response?.data?.message ||
                "Unable to delete user."
            );

        }

    };


    return (

        <>

            <Navbar />


            <main className="dashboard">

                <h1>
                    Admin Dashboard
                </h1>


                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}


                {/* Statistics */}

                {dashboard && (

                    <div className="stats-grid">

                        <div className="stat-card">

                            <h3>
                                Total Users
                            </h3>

                            <strong>
                                {dashboard.totalUsers}
                            </strong>

                        </div>


                        <div className="stat-card">

                            <h3>
                                Documents
                            </h3>

                            <strong>
                                {dashboard.totalDocuments}
                            </strong>

                        </div>


                        <div className="stat-card">

                            <h3>
                                Shared Documents
                            </h3>

                            <strong>
                                {dashboard.totalSharedDocuments}
                            </strong>

                        </div>


                        <div className="stat-card">

                            <h3>
                                Audit Logs
                            </h3>

                            <strong>
                                {dashboard.totalAuditLogs}
                            </strong>

                        </div>

                    </div>

                )}


                {/* Users */}

                <section className="dashboard-section">

                    <div className="section-header">

                        <h2>
                            Users
                        </h2>


                        <select
                            value={sortBy}
                            onChange={(event) => {

                                setSortBy(
                                    event.target.value
                                );

                                setPage(0);

                            }}
                        >

                            <option value="id">
                                ID
                            </option>

                            <option value="fullName">
                                Name
                            </option>

                            <option value="email">
                                Email
                            </option>

                            <option value="role">
                                Role
                            </option>

                        </select>

                    </div>


                    {loading ? (

                        <p>
                            Loading users...
                        </p>

                    ) : (

                        <div className="table-container">

                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            ID
                                        </th>

                                        <th>
                                            Name
                                        </th>

                                        <th>
                                            Email
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {users.map(
                                        (user) => (

                                            <tr
                                                key={user.id}
                                            >

                                                <td>
                                                    {user.id}
                                                </td>

                                                <td>
                                                    {user.fullName}
                                                </td>

                                                <td>
                                                    {user.email}
                                                </td>

                                                <td>
                                                    {user.role}
                                                </td>

                                                <td>

                                                    <button
                                                        onClick={() =>
                                                            deleteUser(
                                                                user.id
                                                            )
                                                        }
                                                        disabled={
                                                            user.role ===
                                                            "ADMIN"
                                                        }
                                                    >

                                                        {user.role ===
                                                        "ADMIN"
                                                            ? "Admin"
                                                            : "Delete"}

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}


                    {/* Pagination */}

                    <div className="pagination">

                        <button
                            disabled={page === 0}
                            onClick={() =>
                                setPage(page - 1)
                            }
                        >
                            Previous
                        </button>


                        <span>
                            Page {page + 1} of{" "}
                            {totalPages}
                        </span>


                        <button
                            disabled={
                                page + 1 >= totalPages
                            }
                            onClick={() =>
                                setPage(page + 1)
                            }
                        >
                            Next
                        </button>

                    </div>

                </section>

            </main>

        </>

    );
}

export default AdminDashboard;