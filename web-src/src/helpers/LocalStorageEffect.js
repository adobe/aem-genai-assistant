export function createLocalStorageEffect(key) {
  return function ({setSelf, onSet}) {
    const savedValue = localStorage.getItem(key)
    if (savedValue != null) {
      setSelf(JSON.parse(savedValue));
    }
    onSet((newValue, _, isReset) => {
      if (isReset) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newValue);
      }
    });
  }
}
