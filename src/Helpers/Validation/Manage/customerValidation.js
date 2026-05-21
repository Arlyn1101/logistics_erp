export const validateCustomer = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    name: false,
  };

  if (!data.name || data.name === "") {
    error.name = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};
