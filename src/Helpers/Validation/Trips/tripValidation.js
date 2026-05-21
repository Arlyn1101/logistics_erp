export const validateTrip = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    contract_id: false,
    contract_route_id: false,
    truck_id: false,
    trip_date: false,
  };

  if (!data.contract_id || data.contract_id === "") {
    error.contract_id = true;
    is_valid = false;
  }
  if (!data.contract_route_id || data.contract_route_id === "") {
    error.contract_route_id = true;
    is_valid = false;
  }
  if (!data.truck_id || data.truck_id === "") {
    error.truck_id = true;
    is_valid = false;
  }
  if (!data.trip_date || data.trip_date === "") {
    error.trip_date = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};
