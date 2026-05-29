import axios from "axios";
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

    const flat_fields = [
      'trade_name', 'bir_name', 'business_type',
      'bir_region', 'bir_province', 'bir_city', 'bir_barangay', 'bir_street',
      'trade_region', 'trade_province', 'trade_city', 'trade_barangay', 'trade_street',
      'tin', 'term', 'credit_limit', 'vat_type', 'bir_2307', 'email',
    ];
    flat_fields.forEach((key) => {
      form_data.append(key, form[key] ?? '');
    });

    const bir_address = [
      form.bir_street,
      form.bir_barangay_name,
      form.bir_city_name,
      form.bir_province_name,
      form.bir_region_name,
    ].filter(Boolean).join(', ');
    form_data.append('bir_address', bir_address);

    const trade_address = [
      form.trade_street,
      form.trade_barangay_name,
      form.trade_city_name,
      form.trade_province_name,
      form.trade_region_name,
    ].filter(Boolean).join(', ');
    form_data.append('trade_address', trade_address);
    form_data.append('address', trade_address);

    // ── HERE IS THE MERGE LOGIC ──
    // Put your hardcoded signatory object into index 0, followed cleanly by the remaining contacts
    const signatory_contact = form.signatory && form.signatory.first_name
      ? [{ ...form.signatory, role: 'Authorized Signatory' }]
      : [];

    const combined_contacts = [
      ...signatory_contact,
      ...(form.contacts || [])
    ];

    // Stringify and append the array to payload
    form_data.append('contacts', JSON.stringify(combined_contacts));

    // Properly extract and rename the native file binary
    attachments.forEach((file) => {
      const current_file = file.originFileObj ? file.originFileObj : (file instanceof File ? file : null);
      
      if (current_file && current_file.name) {
        const company_prefix = (form.trade_name || form.email || "customer").trim().replace(/\s+/g, "_");
        const original_name = current_file.name.split('.').slice(0, -1).join('.').replace(/\s+/g, "_");
        const ext = current_file.name.split(".").pop();
        
        const renamed = new File([current_file], `${company_prefix}_${original_name}.${ext}`, {
          type: current_file.type,
        });
        form_data.append('attachments[]', renamed);
      }
    });

    const response = await axios.post(`${BASE_URL}/customers/create`, form_data, {
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

export const updateCustomer = async (form, attachments = []) => {
  try {
    const form_data = new FormData();
    form_data.append('token', get_token());
    form_data.append('customer_id', form.id);

    const flat_fields = [
      'trade_name', 'bir_name', 'business_type',
      'bir_region', 'bir_province', 'bir_city', 'bir_barangay', 'bir_street',
      'trade_region', 'trade_province', 'trade_city', 'trade_barangay', 'trade_street',
      'tin', 'term', 'credit_limit', 'vat_type', 'bir_2307', 'email',
    ];
    flat_fields.forEach((key) => {
      form_data.append(key, form[key] ?? '');
    });

    form_data.append('bir_address', [form.bir_street, form.bir_barangay_name, form.bir_city_name, form.bir_province_name, form.bir_region_name].filter(Boolean).join(', '));
    form_data.append('trade_address', [form.trade_street, form.trade_barangay_name, form.trade_city_name, form.trade_province_name, form.trade_region_name].filter(Boolean).join(', '));
    form_data.append('address', [form.trade_street, form.trade_barangay_name, form.trade_city_name, form.trade_province_name, form.trade_region_name].filter(Boolean).join(', '));

    const combined_contacts = Array.isArray(form.contacts) ? form.contacts : [];
    form_data.append('contacts', JSON.stringify(combined_contacts));

    // Custom File Renaming Rule: tradename_filename.ext
    attachments.forEach((file) => {
      // Ant Design puts the native File object inside originFileObj. Let's make sure we find it.
      const current_file = file.originFileObj ? file.originFileObj : (file instanceof File ? file : null);
      
      if (current_file && current_file.name) {
        const company_prefix = (form.trade_name || form.email || "customer").trim().replace(/\s+/g, "_");
        const original_name = current_file.name.split('.').slice(0, -1).join('.').replace(/\s+/g, "_");
        const ext = current_file.name.split(".").pop();

        const renamed = new File([current_file], `${company_prefix}_${original_name}.${ext}`, {
          type: current_file.type,
        });
        form_data.append('attachments[]', renamed);
      }
    });

    console.log("FormData entries:");
      for (let [key, val] of form_data.entries()) {
        console.log(key, val);
      }

    const response = await axios.post(`${BASE_URL}/customers/update`, form_data, {
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

export const getCustomerContacts = async (customer_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/customers/get_contacts`, {
      token: get_token(),
      customer_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const getCustomerSuggestions = async (keyword) => {
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

export const getCustomerAttachments = async (customer_id) => {
  try {
    const response = await getAPICall(`${BASE_URL}/customers/get_attachments`, {
      token: get_token(),
      customer_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const downloadCustomerAttachment = (file_path, file_name) => {
  const url = `${BASE_URL}/customers/download_attachment?token=${get_token()}&file_path=${encodeURIComponent(file_path)}&file_name=${encodeURIComponent(file_name)}`;
  window.open(url, "_blank");
};

export const deleteCustomerAttachment = async (attachment_id) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customers/delete_attachment`, {
      token: get_token(),
      attachment_id,
    });
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};