import axios from "axios";
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

export const createPayment = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/contract_billing_payments/create`, {
      token:            get_token(),
      billing_id:       form.billing_id,
      payment_date:     form.payment_date,
      payment_method:   form.payment_method,
      amount:           form.amount,
      reference_number: form.reference_number || null,
      check_number:     form.check_number     || null,
      check_date:       form.check_date       || null,
      bank_name:        form.bank_name        || null,
      deposit_date:     form.deposit_date     || null,
      deposited_to:     form.deposited_to     || null,
      transfer_date:    form.transfer_date    || null,
      remarks:          form.remarks          || null,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getPaymentAttachments = async (payment_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/contract_billing_payments/get_attachments`, {
      token: get_token(),
      payment_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const uploadPaymentAttachments = async (payment_id, files) => {
  try {
    const form_data = new FormData();
    form_data.append("token", get_token());
    form_data.append("payment_id", payment_id);
    files.forEach((file) => form_data.append("attachments[]", file));
    const response = await axios.post(
      `${BASE_URL}/contract_billing_payments/upload_attachment`,
      form_data,
      {
        headers: {
          "api-key": "logistics-erp-api-key",
          "user-key": localStorage.getItem("user_id") || null,
        },
      }
    );
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deletePaymentAttachment = async (attachment_id) => {
  try {
    const response = await postAPICall(
      `${BASE_URL}/contract_billing_payments/delete_attachment`,
      { token: get_token(), attachment_id }
    );
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const downloadPaymentAttachment = (file_path, file_name) => {
  const url = `${BASE_URL}/contract_billing_payments/download_attachment?token=${get_token()}&file_path=${encodeURIComponent(file_path)}&file_name=${encodeURIComponent(file_name)}`;
  window.open(url, "_blank");
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