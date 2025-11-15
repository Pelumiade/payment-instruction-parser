UpdateProfileRequest {
  path /profiles/:id
  method PATCH
  
  params {
    id string<length:26>
  }
  
  body {
    first_name? string<trim|minLength:2|maxLength:35>
    last_name? string<trim|minLength:2|maxLength:35>
    bio? string<trim|maxLength:500>
    avatar_url? string<trim>
    
    settings? {
      theme? string(light|dark|auto)
      notifications? boolean
      language? string(en|es|fr|de)
    }
    
    address? {
      street string<trim|minLength:5>
      city string<trim|minLength:2>
      state string<trim|length:2|uppercase>
      zip_code string<trim|minLength:5|maxLength:10>
      country string<trim|length:2|uppercase>
    }
  }
  
  response.ok {
    http.code 200
    status successful
    message "Profile updated successfully"
    data {
      profile {
        id string<length:26>
        user_id string<length:26>
        first_name string
        last_name string
        bio? string
        avatar_url? string
        settings {
          theme string
          notifications boolean
          language string
        }
        address? {
          street string
          city string
          state string
          zip_code string
          country string
        }
        updated number
      }
    }
  }
  
  response.error {
    http.code 404
    status error
    message "Profile not found"
    data {}
  }
}
