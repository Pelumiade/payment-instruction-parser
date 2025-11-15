import ../commons.go

UserProfile {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  user_id string<isUnique|indexed> // Reference to the user's identity
  username string<isUnique|indexed> // Unique username
  email string // User's email (duplicated for quick access)
  bio? string // User biography/description
  avatar_url? string // URL to user's avatar image
  cover_image_url? string // URL to user's cover/banner image
  
  // User preferences and settings
  settings {
    theme string // UI theme: light, dark, auto
    language string // Preferred language: en, es, fr, de
    notifications_enabled boolean // Whether notifications are enabled
    is_profile_public boolean // Whether profile is publicly visible
  }
  
  // Optional contact information
  contact? {
    phone? string // Phone number
    website? string // Personal website URL
    location? string // User's location/city
  }
  
  // Social media links
  social_links? {
    twitter? string // Twitter handle or URL
    github? string // GitHub username or URL
    linkedin? string // LinkedIn profile URL
    instagram? string // Instagram handle or URL
  }
  
  // User's address information
  addresses[]? {
    label string // Address label: home, work, billing, shipping
    street string // Street address
    city string // City name
    state string // State/province code
    zip_code string // Postal/ZIP code
    country string // Country code (ISO 2-letter)
    is_primary boolean // Whether this is the primary address
    is_billing boolean // Whether this is a billing address
    is_shipping boolean // Whether this is a shipping address
  }
  
  // Professional information
  work_history[]? {
    company string // Company name
    position string // Job position/title
    start_date number // Start timestamp
    end_date? number // End timestamp (null if current)
    is_current boolean // Whether this is the current job
    description? string // Job description
    location? string // Job location
  }
  
  // User interests and hobbies
  interests[]? string // Array of interest/hobby strings
  
  // Skills and expertise
  skills[]? {
    name string // Skill name
    level string // Proficiency level: beginner, intermediate, advanced, expert
    years_of_experience? number // Years of experience with this skill
  }
  
  // Profile statistics
  stats? {
    followers_count number // Number of followers
    following_count number // Number of users being followed
    posts_count number // Number of posts/content created
    engagement_score? number // Engagement metric score
  }
  
  // Privacy and verification
  is_verified boolean // Whether user is verified
  is_private boolean // Whether profile is private
  
  meta? object // Additional metadata
  created number // Timestamp of creation
  updated number // Timestamp of last update
  deleted? number // Timestamp of soft deletion (if paranoid mode)
}
