import ../commons.go

Product {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  name string // Product name
  description string // Product description
  sku string<isUnique|indexed> // Stock Keeping Unit (unique identifier)
  currency string // Currency code (e.g., USD, EUR, GBP)
  price number // Product price
  stock_quantity number // Available stock quantity
  status string<indexed> // Product status: draft, active, archived
  category string<indexed> // Product category: electronics, clothing, food, books, other
  
  // Nested object for product dimensions
  dimensions? {
    length number // Length value
    width number // Width value
    height number // Height value
    unit string // Unit of measurement: cm, inch, meter
  }
  
  // Product settings and flags
  settings {
    is_featured boolean // Whether product is featured
    is_taxable boolean // Whether product is taxable
    tax_rate? number // Tax rate percentage (if applicable)
  }
  
  // Array of product images
  images[]? {
    url string // Image URL
    alt_text? string // Alternative text for accessibility
    is_primary boolean // Whether this is the primary product image
  }
  
  // Product tags for search and categorization
  tags[]? string // Array of tag strings
  
  // Seller/vendor information
  vendor_id? string // ID of the vendor/seller
  
  meta? object // Additional metadata
  created number // Timestamp of creation
  updated number // Timestamp of last update
  deleted? number // Timestamp of soft deletion (if paranoid mode)
}
