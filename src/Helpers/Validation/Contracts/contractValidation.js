export const validateContract = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    customer_id: false,
    monthly_rate: false,
    included_trips: false,
    excess_trip_charge: false,
    fuel_price_per_liter: false,
    start_date: false,
  };

  if (!data.customer_id || data.customer_id === "") {
    error.customer_id = true;
    is_valid = false;
  }
  if (!data.monthly_rate || data.monthly_rate === "") {
    error.monthly_rate = true;
    is_valid = false;
  }
  if (!data.included_trips || data.included_trips === "") {
    error.included_trips = true;
    is_valid = false;
  }
  if (!data.excess_trip_charge || data.excess_trip_charge === "") {
    error.excess_trip_charge = true;
    is_valid = false;
  }
  if (!data.fuel_price_per_liter || data.fuel_price_per_liter === "") {
    error.fuel_price_per_liter = true;
    is_valid = false;
  }
  if (!data.start_date || data.start_date === "") {
    error.start_date = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};

export const validateContractRoute = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    origin: false,
    destination: false,
  };

  if (!data.origin || data.origin === "") {
    error.origin = true;
    is_valid = false;
  }
  if (!data.destination || data.destination === "") {
    error.destination = true;
    is_valid = false;
  }

  set_is_error(error);
  return is_valid;
};
