import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllUsers = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/users/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createUser = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/users/create`, {
      token: get_token(),
      first_name: form.name,
      last_name: '',
      email: form.username,
      password: form.password,
      role: form.type,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateUser = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/users/update`, {
      token: get_token(),
      user_id: form.id,
      first_name: form.name,
      last_name: '',
      email: form.username,
      password: form.password,
      role: form.type,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteUser = async (user_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/users/delete`, {
      token: get_token(),
      user_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};