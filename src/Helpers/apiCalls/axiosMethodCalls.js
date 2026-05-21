import axios from "axios";
import toast from "react-hot-toast";
import { refreshPage } from "../Utils/Common";

// Base API URL — update to match your backend server
export const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost/logistics-api/public";

// Set up global 401 interceptor
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.clear();
      toast.error("Unauthorized. Logging you out...");
      setTimeout(() => {
        window.location.href = "/";
        refreshPage();
      }, 1000);
    }
    return Promise.reject(error);
  }
);

const get_api_key = () => localStorage.getItem("token") || null;

var get_config = () => ({
  "api-key": "logistics-erp-api-key",
  "user-key": get_api_key(),
  "Content-Type": "application/json",
});

// API Axios Get Call
export const getAPICall = (url, data) => {
  return axios.get(url, { headers: get_config(), params: data });
};

// API Axios Post Call
export const postAPICall = (url, data) => {
  return axios.post(url, data, { headers: get_config() });
};

// API Axios Put Call
export const putAPICall = (url, data) => {
  return axios.put(url, data, { headers: get_config() });
};

// API Axios Delete Call
export const deleteAPICall = (url) => {
  return axios.delete(url, { headers: get_config() });
};
