import { getAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAccountsReceivable = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/reports/get_accounts_receivable`, {
      token: get_token(),
      ...filters,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getArCustomerSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/customers/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getArContractSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contracts/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};