import { useState, useEffect } from "react";
import axios from "axios";
import { handleError } from "../../utils/helpers";
import { API_CONFIG } from "../../config/constants";
import Cookies from "js-cookie";

const useGetAllReports = ( limit = 10, currentPage = 1) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);

  const token = Cookies.get("authToken");

  // Fetch reports list
const getAllReports = async (page = currentPage, pageLimit = limit) => {
  setLoading(true);
  try {
    const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/reports`, {
      params: {
          limit,
          page: currentPage,
    
          
          // status: filters.status || undefined,
              },
        headers: { Authorization: `Bearer ${token}` },
      });

    if (response.data.success) {
      const dataReports = response.data.data || {};
      setReports(dataReports.reports || []);
      setTotalData(dataReports.total || 0);
      setTotalPages(Math.ceil((dataReports.total || 0) / pageLimit));
    }
  } catch (error) {
    handleError(error);
  } finally {
    setLoading(false);
  }
};

  // Fetch single report details
  const getReportDetails = async (id) => {
   
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/admin/reports/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setSelectedReport(response.data.data);
        return response.data.data;
      }
    } catch (error) {
      handleError(error);
      console.error("Error fetching report details", error);
    } finally {
      setLoading(false);
    }
  };


const restrictUser = async (userId, payload) => {
  setLoading(true);
  try {
    const response = await axios.patch(
      `${API_CONFIG.baseURL}/api/admin/users/${userId}/restrict`,
      payload,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (response.data.success) {
      
        console.log(response)
      return response.data.data; 
    }
  } catch (error) {
    handleError(error);
    throw error;
  } finally {
    setLoading(false);
  }
};



console.log(selectedReport)
  useEffect(() => {
    getAllReports();
  }, [limit, currentPage]);

  return {
    reports,
    totalData,
    totalPages,
    loading,
    selectedReport,
    getAllReports,
    getReportDetails,
    restrictUser,
    setReports
  };
};

export default useGetAllReports;
