export const validateTruck = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    unit_code: false,
    plate_number: false,
  };

  if (!data.unit_code || data.unit_code.trim() === "") {
    error.unit_code = true;
    is_valid = false;
  }
  if (!data.plate_number || data.plate_number.trim() === "") {
    error.plate_number = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};
