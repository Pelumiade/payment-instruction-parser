root {
  id string<uppercase>
  ts? number<timestamptohex|uppercase>
  meta {
    name string<minLength:4>
    value string(active|inactive)<indexed>
    colors[] number
    dist[] {
      chapter string<uppercase>
    }
    chromes[]? string as miummium
  }
  tags[] string
  places[] {
    bank string
    amount number
  }
}