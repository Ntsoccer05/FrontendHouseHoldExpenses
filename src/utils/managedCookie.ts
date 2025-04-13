// クッキー設定関数
export const setCookie = (name:string, value, minutes=null) => {
  const d = new Date();
  // d.setTime(d.getTime() + (minutes * 60 * 1000)); // 分単位で有効期限を設定
  d.setTime(d.getTime());
  const expires = "expires=" + d.toUTCString();
  // document.cookie = `${name}=${value}; ${expires}; path=/`;
  document.cookie = `${name}=${value}`;
};

// クッキー取得関数
export const getCookie = (name:string) => {
  const cname = name + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  // const ca = decodedCookie.split(';');
  // for (let i = 0; i < ca.length; i++) {
  //   let c = ca[i];
  //   while (c.charAt(0) === ' ') c = c.substring(1);
  //   if (c.indexOf(cname) === 0) return c.substring(cname.length, c.length);
  // }
  if (decodedCookie.indexOf(cname) === 0) return decodedCookie.substring(cname.length, decodedCookie.length);
  return "";
};

// クッキー削除関数
export const deleteCookie = (name:string) => {
  // document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  document.cookie = `${name}=`;
};
