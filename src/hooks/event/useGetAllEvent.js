// src/hooks/event/useEvents.js
import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { handleError } from "../../utils/helpers";
import { API_CONFIG } from "../../config/constants";

const useGetAllEvents = (limit = 10, currentPage = 1) => {
  const [events, setEvents] = useState([]);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ type: "" }); // filter by type if needed

  const token = Cookies.get("authToken");

  // Fetch events list
  const getEvents = async (page = currentPage, pageLimit = limit) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/events`, {
        params: {
          limit: pageLimit,
          page,
          
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        const dataEvents = response.data.data || {};
        setEvents(dataEvents.events || []);
        setTotalData(dataEvents.total || 0);
        setTotalPages(Math.ceil((dataEvents.total || 0) / pageLimit));
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching events", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single event details
  const getEventDetails = async (id) => {
    
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedEvent(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching event details", error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-fetch when page or filters change
  useEffect(() => {
    getEvents(currentPage, limit);
  }, [currentPage, limit]);
console.log(events) 
  return {
    events,
    totalData,
    totalPages,
    selectedEvent,
    loading,
    filters,
    setFilters,
    getEvents,
    getEventDetails,
    setEvents,
  };
};

export default useGetAllEvents;
