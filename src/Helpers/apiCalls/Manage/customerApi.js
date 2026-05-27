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
      'tin', 'term', 'credit_limit', 'vat_type', 'bir_2307', 'email', 'address',
    ];
    flat_fields.forEach((key) => {
      form_data.append(key, form[key] ?? '');
    });

    // ── HERE IS THE MERGE LOGIC ──
    // Put your hardcoded signatory object into index 0, followed cleanly by the remaining contacts
    const combined_contacts = [
      form.signatory,
      ...(form.contacts || [])
    ];

    // Stringify and append the array to payload
    form_data.append('contacts', JSON.stringify(combined_contacts));

    attachments.forEach((file) => {
      form_data.append('attachments[]', file.originFileObj);
    });

    const response = await postAPICall(`${BASE_URL}/customers/create`, form_data);
    return { data: response.data };
  } catch (error) {
    return { error: error.response };
  }
};

export const updateCustomer = async (form) => {
  try {
    const response = await postAPICall(`${BASE_URL}/customers/update`, {
      token:          get_token(),
      customer_id:    form.id,
      trade_name:     form.trade_name,
      bir_name:       form.bir_name,
      business_type:  form.business_type,       // ← new
      bir_region:     form.bir_region,           // ← new
      bir_province:   form.bir_province,
      bir_city:       form.bir_city,
      bir_barangay:   form.bir_barangay,
      bir_street:     form.bir_street,
      trade_region:   form.trade_region,         // ← new
      trade_province: form.trade_province,
      trade_city:     form.trade_city,
      trade_barangay: form.trade_barangay,
      trade_street:   form.trade_street,
      tin:            form.tin,
      term:           form.term,
      credit_limit:   form.credit_limit,
      vat_type:       form.vat_type,
      bir_2307:       form.bir_2307,
      email:          form.email,
      address:        form.address,
      contacts:       JSON.stringify(form.contacts ?? []),
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