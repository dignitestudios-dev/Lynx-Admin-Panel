import { useState, useEffect } from "react";
import axios from "axios";
import { handleError } from "../../utils/helpers";
import { API_CONFIG } from "../../config/constants";
import Cookies from "js-cookie";

const useGetAllUsers = (filters = {}, search = "", limit = 10, currentPage = 1) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);

  const token = Cookies.get("authToken");


  const getAllUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/users`, {
        params: {
          limit,
          page: currentPage,
          name: search || undefined,
          // status: filters.status || undefined,
              },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const dataUsers = response.data.data || {};
        setUsers(dataUsers.users || []);
        setTotalData(dataUsers.total || 0);
        setTotalPages(Math.ceil((dataUsers.total || 0) / limit));
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching users", error);
    } finally {
      setLoading(false);
    }
  };

  const getUserDetails = async (id) => {
    
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedUser(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching user details", error);
    } finally {
      setLoading(false);
    }
  };


const blockUser = async (userId, block) => {
  try {
    const response = await axios.patch(
      `${API_CONFIG.baseURL}/api/admin/users/${userId}/status`,
      { status: block }, // true = active, false = blocked
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // Refresh the users list if API call was successful
    if (response.data.success) {
      getAllUsers();
    }

    return response.data;
  } catch (error) {
    handleError(error);
  }
};


  useEffect(() => {
   
    getAllUsers();
  }, [search, limit, currentPage]);

  return {
    users,
    totalData,
    totalPages,
    loading,
    selectedUser,
    getAllUsers,
    getUserDetails,
    blockUser
  };
};

export default useGetAllUsers;
