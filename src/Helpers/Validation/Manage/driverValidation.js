export const validateDriver = (data, set_is_error) => {
  var is_valid = true;
  var error = {
    first_name: false,
    last_name: false,
    contact_number: false,
    address: false,
    birthdate: false,
    gender: false,
    emergency_contact_name: false,
    emergency_contact_number: false,
    emergency_contact_relationship: false,
    emergency_contact_address: false,
  };

  if (!data.first_name) { error.first_name = true; is_valid = false; }
  if (!data.last_name) { error.last_name = true; is_valid = false; }
  if (!data.contact_number) { error.contact_number = true; is_valid = false; }
  if (!data.address) { error.address = true; is_valid = false; }
  if (!data.birthdate) { error.birthdate = true; is_valid = false; }
  if (!data.gender) { error.gender = true; is_valid = false; }
  if (!data.emergency_contact_name) { error.emergency_contact_name = true; is_valid = false; }
  if (!data.emergency_contact_number) { error.emergency_contact_number = true; is_valid = false; }
  if (!data.emergency_contact_relationship) { error.emergency_contact_relationship = true; is_valid = false; }
  if (!data.emergency_contact_address) { error.emergency_contact_address = true; is_valid = false; }

  set_is_error(error);
  return is_valid;
};
