// Common fields shared across models
// These can be imported and spread into model definitions using ...common

common {
  created number // Timestamp of creation
  updated number // Timestamp of last update
  deleted? number // Timestamp of soft deletion (if paranoid mode enabled)
}
