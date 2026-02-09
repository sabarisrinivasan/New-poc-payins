export function useDebouncedValue(getValue: () => string, delay = 500) {
  let debounced = $state('');

  $effect(() => {
    const currentValue = getValue(); // This tracks the reactive dependency
    const timeout = setTimeout(() => {
      debounced = currentValue;
    }, delay);

    return () => clearTimeout(timeout);
  });

  return {
    get current() {
      return debounced;
    }
  };
}