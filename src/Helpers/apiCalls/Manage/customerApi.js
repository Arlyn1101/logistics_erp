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
    const signatory_contact = form.signatory && form.signatory.first_name
      ? [{ ...form.signatory, role: 'Authorized Signatory' }]
      : [];

    const combined_contacts = [
      ...signatory_contact,
      ...(form.contacts || [])
    ];

    const response = await postAPICall(`${BASE_URL}/customers/update`, {
      token:          get_token(),
      customer_id:    form.id,
      trade_name:     form.trade_name,
      bir_name:       form.bir_name,
      business_type:  form.business_type,
      bir_region:     form.bir_region,
      bir_province:   form.bir_province,
      bir_city:       form.bir_city,
      bir_barangay:   form.bir_barangay,
      bir_street:     form.bir_street,
      trade_region:   form.trade_region,
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
      bir_address:    [form.bir_street, form.bir_barangay_name, form.bir_city_name, form.bir_province_name, form.bir_region_name].filter(Boolean).join(', '),
      trade_address:  [form.trade_street, form.trade_barangay_name, form.trade_city_name, form.trade_province_name, form.trade_region_name].filter(Boolean).join(', '),
      address:        [form.trade_street, form.trade_barangay_name, form.trade_city_name, form.trade_province_name, form.trade_region_name].filter(Boolean).join(', '),
      contacts:       JSON.stringify(combined_contacts),
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