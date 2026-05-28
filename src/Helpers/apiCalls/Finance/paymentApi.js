import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllPayments = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billing_payments/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchPayments = async (filters = {}) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billing_payments/search`, {
      token: get_token(),
      ...filters,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getPaymentDetails = async (payment_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billing_payments/details`, {
      token: get_token(),
      payment_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createPayment = async (data) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_billing_payments/create`, {
      token: get_token(),
      ...data,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deletePayment = async (payment_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_billing_payments/delete`, {
      token: get_token(),
      payment_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};