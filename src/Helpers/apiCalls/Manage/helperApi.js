import axios from "axios";
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

export const createHelper = async (form, attachments = []) => {
  try {
    const form_data = new FormData();
    form_data.append("token",                          get_token());
    form_data.append("first_name",                     form.first_name);
    form_data.append("middle_name",                    form.middle_name);
    form_data.append("last_name",                      form.last_name);
    form_data.append("suffix",                         form.suffix);
    form_data.append("contact_number",                 form.contact_number);
    form_data.append("address",                        form.address);
    form_data.append("birthdate",                      form.birthdate);
    form_data.append("gender",                         form.gender);
    form_data.append("civil_status",                   form.civil_status);
    form_data.append("nationality",                    form.nationality);
    form_data.append("religion",                       form.religion);
    form_data.append("email",                          form.email);
    form_data.append("emergency_contact_name",         form.emergency_contact_name);
    form_data.append("emergency_contact_number",       form.emergency_contact_number);
    form_data.append("emergency_contact_relationship", form.emergency_contact_relationship);
    form_data.append("emergency_contact_address",      form.emergency_contact_address);
    form_data.append("sss_number",                     form.sss_number);
    form_data.append("pagibig_number",                 form.pagibig_number);
    form_data.append("philhealth_number",              form.philhealth_number);
    form_data.append("tin_number",                     form.tin_number);

    attachments.forEach((file) => {
      const last_name = (form.last_name || "Helper").replace(/\s+/g, "");
      const ext       = file.name.split(".").pop();
      const renamed   = new File([file], `${last_name}_License.${ext}`, { type: file.type });
      form_data.append("attachments[]", renamed);
    });

    const response = await axios.post(`${BASE_URL}/helpers/create`, form_data, {
      headers: {
        "api-key": "logistics-erp-api-key",
        "user-key": localStorage.getItem("user_id") || null,
      },
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateHelper = async (form, attachments = []) => {
  try {
    const form_data = new FormData();
    form_data.append("token",                          get_token());
    form_data.append("helper_id",                      form.id);
    form_data.append("first_name",                     form.first_name);
    form_data.append("middle_name",                    form.middle_name);
    form_data.append("last_name",                      form.last_name);
    form_data.append("suffix",                         form.suffix);
    form_data.append("contact_number",                 form.contact_number);
    form_data.append("address",                        form.address);
    form_data.append("status",                         form.status);
    form_data.append("birthdate",                      form.birthdate);
    form_data.append("gender",                         form.gender);
    form_data.append("civil_status",                   form.civil_status);
    form_data.append("nationality",                    form.nationality);
    form_data.append("religion",                       form.religion);
    form_data.append("email",                          form.email);
    form_data.append("emergency_contact_name",         form.emergency_contact_name);
    form_data.append("emergency_contact_number",       form.emergency_contact_number);
    form_data.append("emergency_contact_relationship", form.emergency_contact_relationship);
    form_data.append("emergency_contact_address",      form.emergency_contact_address);
    form_data.append("sss_number",                     form.sss_number);
    form_data.append("pagibig_number",                 form.pagibig_number);
    form_data.append("philhealth_number",              form.philhealth_number);
    form_data.append("tin_number",                     form.tin_number);

    attachments.forEach((file) => {
      const last_name = (form.last_name || "Helper").replace(/\s+/g, "");
      const ext       = file.name.split(".").pop();
      const renamed   = new File([file], `${last_name}_License.${ext}`, { type: file.type });
      form_data.append("attachments[]", renamed);
    });

    const response = await axios.post(`${BASE_URL}/helpers/update`, form_data, {
      headers: {
        "api-key": "logistics-erp-api-key",
        "user-key": localStorage.getItem("user_id") || null,
      },
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

export const getHelperAttachments = async (helper_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/get_attachments`, {
      token: get_token(),
      helper_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const downloadHelperAttachment = (file_path, file_name) => {
  const url = `${BASE_URL}/helpers/download_attachment?token=${get_token()}&file_path=${encodeURIComponent(file_path)}&file_name=${encodeURIComponent(file_name)}`;
  window.open(url, "_blank");
};

export const deleteHelperAttachment = async (attachment_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/helpers/delete_attachment`, {
      token: get_token(),
      attachment_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getHelperSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/helpers/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};