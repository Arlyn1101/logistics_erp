export const validateCustomer = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    first_name: false,
    last_name: false,
    contact_email: false,
    contact_number: false,
    contact_role: false,
  };

  const primary = data.contacts?.[0];

  if (!primary?.first_name?.trim()) {
    error.first_name = true;
    is_valid = false;
  }

  if (!primary?.last_name?.trim()) {
    error.last_name = true;
    is_valid = false;
  }

  if (!primary?.email?.trim()) {
    error.contact_email = true;
    is_valid = false;
  }

  if (!primary?.number?.trim()) {
    error.contact_number = true;
    is_valid = false;
  }

  if (!primary?.role?.trim()) {
    error.contact_role = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};