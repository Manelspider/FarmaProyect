import './style.css'
import { setupCounter } from './counter'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div>
    <h1>FarmaProject App</h1>
    <div class="card">
      <button id="counter" type="button"></button>
    </div>
    <p class="read-the-docs">
      Click on the Vite logo to learn more
    </p>
  </div>
`

setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
