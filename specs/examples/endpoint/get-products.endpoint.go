GetProductsRequest {
  path /products
  method GET
  
  query {
    page? number<min:1>
    limit? number<min:1|max:100>
    category? string(electronics|clothing|food|books|other)
    status? string(draft|active|archived)
    search? string<trim|minLength:2>
    sort_by? string(name|price|created|updated)
    sort_order? string(asc|desc)
  }
  
  response.ok {
    http.code 200
    status successful
    message "Products fetched successfully"
    data {
      products[] {
        id string<length:26>
        name string
        description string
        sku string
        price number
        currency string
        stock_quantity number
        status string
        category string
        created number
        updated number
      }
      pagination {
        page number
        limit number
        total number
        total_pages number
      }
    }
  }
  
  response.error {
    http.code 400
    status error
    message "Invalid query parameters"
    data {
      errors[] {
        field string
        message string
        code string
      }
    }
  }
}
