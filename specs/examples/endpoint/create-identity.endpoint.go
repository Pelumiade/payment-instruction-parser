CreateIdentityRequest {
  path /identities
  method POST
  
  body {
    email string<trim|lowercase|isEmail>
    password string<minLength:8|maxLength:128>
    first_name string<trim|minLength:2|maxLength:35>
    last_name string<trim|minLength:2|maxLength:35>
    middle_name? string<trim|minLength:2|maxLength:35>
    phonenumber? string<minLength:10|maxLength:14>
  }
  
  response.ok {
    http.code 201
    status successful
    message "Identity created successfully"
    data {
      identity {
        id string<length:26>
        email string
        first_name string
        last_name string
        middle_name? string
        phonenumber? string
        status string
        created number
        updated number
      }
    }
  }
  
  response.error {
    http.code 400
    status error
    message "Validation failed"
    data {
      errors[] {
        field string
        message string
        code string
      }
    }
  }
}
