import axios from "axios";
import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllDrivers = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchDrivers = async (
  name = null,
  license_number = null,
  status = null,
) => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/search`, {
      token: get_token(),
      name,
      license_number,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getDriverDetails = async (driver_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/details`, {
      token: get_token(),
      driver_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createDriver = async (form, attachments = []) => {
  try {
    const form_data = new FormData();
    form_data.append("token", get_token());
    form_data.append("first_name", form.first_name);
    form_data.append("middle_name", form.middle_name);
    form_data.append("last_name", form.last_name);
    form_data.append("suffix", form.suffix);
    form_data.append("contact_number", form.contact_number);
    form_data.append("address", form.address);
    form_data.append("birthdate", form.birthdate);
    form_data.append("gender", form.gender);
    form_data.append("civil_status", form.civil_status);
    form_data.append("nationality", form.nationality);
    form_data.append("religion", form.religion);
    form_data.append("email", form.email);
    form_data.append("emergency_contact_name", form.emergency_contact_name);
    form_data.append("emergency_contact_number", form.emergency_contact_number);
    form_data.append(
      "emergency_contact_relationship",
      form.emergency_contact_relationship,
    );
    form_data.append(
      "emergency_contact_address",
      form.emergency_contact_address,
    );
    form_data.append("license_number", form.license_number);
    form_data.append("license_expiry", form.license_expiry);
    form_data.append("sss_number", form.sss_number);
    form_data.append("pagibig_number", form.pagibig_number);
    form_data.append("philhealth_number", form.philhealth_number);
    form_data.append("tin_number", form.tin_number);

    attachments.forEach((file) => {
      const last_name = (form.last_name || "Driver").replace(/\s+/g, "");
      const ext = file.name.split(".").pop();
      const renamed = new File([file], `${last_name}_License.${ext}`, {
        type: file.type,
      });
      form_data.append("attachments[]", renamed);
    });

    const response = await axios.post(`${BASE_URL}/drivers/create`, form_data, {
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

export const updateDriver = async (form, attachments = []) => {
  try {
    const form_data = new FormData();
    form_data.append("token", get_token());
    form_data.append("driver_id", form.id);
    form_data.append("first_name", form.first_name);
    form_data.append("middle_name", form.middle_name);
    form_data.append("last_name", form.last_name);
    form_data.append("suffix", form.suffix);
    form_data.append("contact_number", form.contact_number);
    form_data.append("address", form.address);
    form_data.append("status", form.status);
    form_data.append("birthdate", form.birthdate);
    form_data.append("gender", form.gender);
    form_data.append("civil_status", form.civil_status);
    form_data.append("nationality", form.nationality);
    form_data.append("religion", form.religion);
    form_data.append("email", form.email);
    form_data.append("emergency_contact_name", form.emergency_contact_name);
    form_data.append("emergency_contact_number", form.emergency_contact_number);
    form_data.append(
      "emergency_contact_relationship",
      form.emergency_contact_relationship,
    );
    form_data.append(
      "emergency_contact_address",
      form.emergency_contact_address,
    );
    form_data.append("license_number", form.license_number);
    form_data.append("license_expiry", form.license_expiry);
    form_data.append("sss_number", form.sss_number);
    form_data.append("pagibig_number", form.pagibig_number);
    form_data.append("philhealth_number", form.philhealth_number);
    form_data.append("tin_number", form.tin_number);

    attachments.forEach((file) => {
      const last_name = (form.last_name || "Driver").replace(/\s+/g, "");
      const ext = file.name.split(".").pop();
      const renamed = new File([file], `${last_name}_License.${ext}`, {
        type: file.type,
      });
      form_data.append("attachments[]", renamed);
    });

    const response = await axios.post(`${BASE_URL}/drivers/update`, form_data, {
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

export const deleteDriver = async (driver_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/drivers/delete`, {
      token: get_token(),
      driver_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getDriverAttachments = async (driver_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/get_attachments`, {
      token: get_token(),
      driver_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const downloadDriverAttachment = (file_path, file_name) => {
  const url = `${BASE_URL}/drivers/download_attachment?token=${get_token()}&file_path=${encodeURIComponent(file_path)}&file_name=${encodeURIComponent(file_name)}`;
  window.open(url, "_blank");
};

export const deleteDriverAttachment = async (attachment_id) => {
  try {
    const response = await postAPICall(
      `${BASE_URL}/drivers/delete_attachment`,
      {
        token: get_token(),
        attachment_id,
      },
    );
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getDriverSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/drivers/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};
