import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { handleError } from "../../utils/helpers";
import { API_CONFIG } from "../../config/constants";

const useNotifications = (page = 1, limit = 20) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);

  const token = Cookies.get("authToken");

  // Fetch all notifications
  const getNotifications = async (pageNumber = page, pageSize = limit) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/notifications`, {
        params: { page: pageNumber, limit: pageSize },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const data = response.data.data || {};
        setNotifications(data.notifications || []);
        setTotalData(data.total || 0);
        setTotalPages(Math.ceil((data.total || 0) / pageSize));
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching notifications", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single notification details
  const getNotificationDetails = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedNotification(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching notification details", error);
    } finally {
      setLoading(false);
    }
  };

  // Create notification
  const createNotification = async (notificationData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/admin/notifications`,
        notificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Refresh list
        await getNotifications();
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error creating notification", error);
    } finally {
      setLoading(false);
    }
  };

  // Update notification
  const updateNotification = async (id, notificationData) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${API_CONFIG.baseURL}/api/admin/notifications/${id}`,
        notificationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        await getNotifications();
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error updating notification", error);
    } finally {
      setLoading(false);
    }
  };

  // Delete notification
  const deleteNotification = async (id) => {
    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_CONFIG.baseURL}/api/admin/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        // Remove from state immediately
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error deleting notification", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto fetch notifications on mount or when page/limit changes
  useEffect(() => {
    getNotifications(page, limit);
  }, [page, limit]);

  return {
    notifications,
    totalData,
    totalPages,
    loading,
    selectedNotification,
    getNotifications,
    getNotificationDetails,
    createNotification,
    updateNotification,
    deleteNotification,
  };
};

export default useNotifications;
