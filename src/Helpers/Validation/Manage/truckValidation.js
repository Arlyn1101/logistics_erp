export const validateTruck = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    plate_number: false,
    truck_type: false,
  };

  if (!data.plate_number || data.plate_number === "") {
    error.plate_number = true;
    is_valid = false;
  }
  if (!data.truck_type || data.truck_type === "") {
    error.truck_type = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};
