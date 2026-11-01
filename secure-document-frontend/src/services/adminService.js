import api from "./api";

const adminService = {
  getDashboard: async () => {
    const response = await api.get("/admin/dashboard");
    return response.data;
  },

  getUsers: async (page = 0, size = 5, sortBy = "fullName") => {
    const response = await api.get("/admin/users", {
      params: {
        page,
        size,
        sortBy,
      },
    });

    return response.data;
  },

  getUserById: async (id) => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  deleteUser: async (id) => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },
};

export default adminService;