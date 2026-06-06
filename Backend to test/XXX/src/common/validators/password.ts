export const PASSWORD_REGEX =
  /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_MESSAGE =
  'Password must contain at least 8 characters, 1 uppercase letter, 1 digit and 1 special character.';
