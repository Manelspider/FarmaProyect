export function setupCounter(element: HTMLButtonElement) {
  let count: number = 0
  const increment = () => {
    count++
    element.innerHTML = `count is ${count}`
  }
  element.addEventListener('click', increment)
  increment()
}
