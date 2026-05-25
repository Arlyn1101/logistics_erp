export const validateCustomer = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    first_name: false,
    last_name: false,
  };

  if (!data.first_name || data.first_name === "") {
    error.first_name = true;
    is_valid = false;
  }

  if (!data.last_name || data.last_name === "") {
    error.last_name = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};