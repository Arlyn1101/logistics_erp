import axios from "axios";
import { getAPICall, postAPICall, BASE_URL } from "../axiosMethodCalls";

const get_token = () => localStorage.getItem("token") || null;

export const getAllTrucks = async () => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/index`, {
      token: get_token(),
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const searchTrucks = async (
  unit_code = null,
  plate_number = null,
  status = null,
) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/search`, {
      token: get_token(),
      unit_code,
      plate_number,
      status,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getTruckDetails = async (truck_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/details`, {
      token: get_token(),
      truck_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const downloadTruckAttachment = (file_path, file_name) => {
  const params = new URLSearchParams({
    token: get_token(),
    file_path,
    file_name,
  });
  window.location.href = `${BASE_URL}/trucks/download_attachment?${params.toString()}`;
};

export const getTruckAttachments = async (truck_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/get_attachments`, {
      token: get_token(),
      truck_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const createTruck = async (
  form,
  or_attachments = [],
  cr_attachments = [],
) => {
  try {
    const form_data = new FormData();
    form_data.append("token", get_token());
    form_data.append("unit_code", form.unit_code || "");
    form_data.append("plate_number", form.plate_number || "");
    form_data.append("color", form.color || "");
    form_data.append("capacity", form.capacity || "");
    form_data.append("km_per_liter", form.km_per_liter || "");
    form_data.append("truck_type", form.truck_type || "");
    form_data.append("or_expiry", form.or_expiry || "");
    form_data.append("status", form.status || "active");
    form_data.append("remarks", form.remarks || "");
    const unit_code = form.unit_code.replace(/\s+/g, "");
    or_attachments.forEach((file) => {
      const ext = file.name.split(".").pop();
      const renamed = new File([file], `${unit_code}_OR.${ext}`, {
        type: file.type,
      });
      form_data.append("attachments[]", renamed);
    });
    cr_attachments.forEach((file) => {
      const ext = file.name.split(".").pop();
      const renamed = new File([file], `cr_${unit_code}_CR.${ext}`, {
        type: file.type,
      });
      form_data.append("attachments[]", renamed);
    });
    const response = await axios.post(`${BASE_URL}/trucks/create`, form_data, {
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

export const updateTruck = async (
  form,
  or_attachments = [],
  cr_attachments = [],
) => {
  try {
    const form_data = new FormData();
    form_data.append("token", get_token());
    form_data.append("truck_id", form.id);
    form_data.append("unit_code", form.unit_code || "");
    form_data.append("plate_number", form.plate_number || "");
    form_data.append("color", form.color || "");
    form_data.append("capacity", form.capacity || "");
    form_data.append("km_per_liter", form.km_per_liter || "");
    form_data.append("truck_type", form.truck_type || "");
    form_data.append("or_expiry", form.or_expiry || "");
    form_data.append("status", form.status || "active");
    form_data.append("remarks", form.remarks || "");
    const unit_code = form.unit_code.replace(/\s+/g, "");
    or_attachments.forEach((file) => {
      const ext = file.name.split(".").pop();
      const renamed = new File([file], `${unit_code}_OR.${ext}`, { type: file.type });
      form_data.append("attachments[]", renamed);
    });
    cr_attachments.forEach((file) => {
      const ext = file.name.split(".").pop();
      const renamed = new File([file], `cr_${unit_code}_CR.${ext}`, { type: file.type });
      form_data.append("attachments[]", renamed);
    });
    const response = await axios.post(`${BASE_URL}/trucks/update`, form_data, {
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

export const deleteTruckAttachment = async (attachment_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trucks/delete_attachment`, {
      token: get_token(),
      attachment_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const deleteTruck = async (truck_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/trucks/delete`, {
      token: get_token(),
      truck_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getTruckSuggestions = async (keyword) => {
  try {
    const response = await getAPICall(`${BASE_URL}/trucks/get_suggestions`, {
      token: get_token(),
      keyword,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};