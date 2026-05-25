import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllCustomers = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/customers/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchCustomers = async (name = null, status = null) => {
  try {
    const response = await getAPICall(`${BASE_URL}/customers/search`, {
      token: get_token(),
      name,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getCustomerDetails = async (customer_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/customers/details`, {
      token: get_token(),
      customer_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createCustomer = async (form, attachments = []) => {
  try {
    const form_data = new FormData();
    form_data.append('token', get_token());

    // append all form fields
    Object.keys(form).forEach((key) => {
      form_data.append(key, form[key] ?? '');
    });

    // append files
    attachments.forEach((file) => {
      form_data.append('attachments[]', file.originFileObj);
    });

    const response = await postAPICall(
      `${BASE_URL}/customers/create`,
      form_data
    );
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateCustomer = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customers/update`, {
      token: get_token(),
      customer_id: form.id,
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteCustomer = async (customer_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customers/delete`, {
      token: get_token(),
      customer_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};