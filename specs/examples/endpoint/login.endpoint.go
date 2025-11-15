LoginRequest {
  path /login
  method POST
  
  body {
    email string<trim|lowercase|isEmail>
    password string<minLength:8>
  }
  
  response.ok {
    http.code 200
    status successful
    message "Login successful"
    data {
      user {
        id string<length:26>
        email string
        first_name string
        last_name string
        status string
      }
      token {
        access_token string
        token_type string
        expires_in number
      }
    }
  }
  
  response.error {
    http.code 401
    status error
    message "Invalid credentials"
    data {}
  }
}
