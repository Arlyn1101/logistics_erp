import { getAPICall, postAPICall, BASE_URL } from "./axiosMethodCalls";

export const loginUser = async (username, password) => {
  try {
    const response = await postAPICall(`${BASE_URL}/login`, {
      email: username,
      password,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const logoutUser = async () => {
  try {
    const response = await postAPICall(`${BASE_URL}/logout`, {});
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
