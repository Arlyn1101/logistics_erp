import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllHelpers = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchHelpers = async (name = null, status = null) => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/search`, {
      token: get_token(),
      name,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getHelperDetails = async (helper_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/details`, {
      token: get_token(),
      helper_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createHelper = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/create`, {
      token: get_token(),
      ...form,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateHelper = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/update`, {
      token: get_token(),
      helper_id: form.id,
      first_name: form.first_name,
      middle_name: form.middle_name,
      last_name: form.last_name,
      suffix: form.suffix,
      birthdate: form.birthdate,
      gender: form.gender,
      civil_status: form.civil_status,
      nationality: form.nationality,
      religion: form.religion,
      email: form.email,
      contact_number: form.contact_number,
      address: form.address,
      emergency_contact_name: form.emergency_contact_name,
      emergency_contact_number: form.emergency_contact_number,
      emergency_contact_relationship: form.emergency_contact_relationship,
      emergency_contact_address: form.emergency_contact_address,
      status: form.status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteHelper = async (helper_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/delete`, {
      token: get_token(),
      helper_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
