import moment from "moment";
import toast from "react-hot-toast";

/***************************
 * Common Utilities
 ***************************/

export const refreshPage = () => {
  window.location.reload();
};

export const getTodayDateISO = () => {
  let deets = new Date();
  let date = deets.toLocaleString("en-US", { timeZone: "Asia/Manila" });
  return moment(date).format("yyyy-MM-DD");
};

export const formatDate = (date) => {
  if (date) {
    var string_date = date.split("-");
    return string_date[1] + "/" + string_date[2] + "/" + string_date[0];
  }
  return "";
};

export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || amount === "") return "";
  return Number(amount).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const toastStyle = () => {
  return {
    fontFamily: "var(--primary-font-medium)",
    fontSize: "14px",
  };
};

// Auth helpers
export const getToken = () => {
  return localStorage.getItem("token") || null;
};

export const getUserId = () => {
  return localStorage.getItem("user_id") || null;
};

export const getName = () => {
  return localStorage.getItem("name") || null;
};

export const getType = () => {
  return localStorage.getItem("type") || null;
};

export const setUserSession = (token, user) => {
  localStorage.setItem("token", token);
  localStorage.setItem("user_id", user.id);
  localStorage.setItem("name", user.first_name + " " + user.last_name);
  localStorage.setItem("type", user.role);
};

export const removeUserSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user_id");
  localStorage.removeItem("name");
  localStorage.removeItem("type");
};

export const isAdmin = getType() === "admin";

export const dateFormat = (date) => {
  if (date) {
    return moment(date).format("MMM DD, YYYY");
  }
  return "";
};

export const dateTimeFormat = (date) => {
  if (date) {
    return moment(date).format("MMM DD, YYYY h:mm A");
  }
  return "";
};