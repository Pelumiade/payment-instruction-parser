import ../commons.go

Identity {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  email string<isUnique|indexed> // User's email address
  password string // Hashed password (bcrypt)
  first_name string // User's first name
  last_name string // User's last name
  middle_name? string // User's middle name (optional)
  phonenumber? string // User's phone number (optional)
  age? number // User's age (optional)
  status string<indexed> // Account status: active, inactive, pending
  roles[] string // User roles: admin, user, moderator
  last_login? number // Timestamp of last login
  login_attempts? number // Number of failed login attempts
  meta? object // Additional metadata
  created number // Timestamp of creation
  updated number // Timestamp of last update
  deleted? number // Timestamp of soft deletion (if paranoid mode)
}
