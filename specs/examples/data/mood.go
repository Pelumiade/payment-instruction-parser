import ../commons.go

Mood {
  _id string<isUnique|indexed> // Unique identifier (ULID)
  user_id string<indexed> // Id of the user the mood entry belongs to
  emoji string // Emoji of the mood (a single emoji)
  text? string<maxLength:140> // Additional text the user can add to the mood entry
  image? string // Optional image url - for when image addition is supported on the app
  is_public? boolean // Whether or not user wants this visible to the public. Defaults to true
  meta? object // Any additional meta needed
  created number // Timestamp of creation
  updated number // Timestamp of last update
  deleted? number // Timestamp of soft deletion (if paranoid mode)
}
