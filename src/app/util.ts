export function base64_Encode(str: string) {
  return btoa(str).replace('/','-')
}

export function base64_Decode(base64_str:string) {
  return atob(base64_str.replace('-','/'))
}
