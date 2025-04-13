// セッションストレージ設定関数
export const setSessionStorage = (name:string, value, minutes=null) => {
  // JSON形式にしてセッションに格納
  window.sessionStorage.setItem(name, JSON.stringify(value))
};

// セッションストレージ取得関数
export const getSessionStorage = (name:string) => {
  // JSON形式からオブジェクト形式にして取得
  return JSON.parse(window.sessionStorage.getItem(name))
};

// セッションストレージ削除関数
export const deleteSessionStorage = (name:string) => {
  window.sessionStorage.removeItem(name);
};

// 全てのセッションストレージ削除関数
export const deleteAllSessionStorage = () => {
  window.sessionStorage.clear();
};
