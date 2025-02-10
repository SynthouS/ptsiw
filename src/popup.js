document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('scriptInput');
  const { savedScript } = await chrome.storage.local.get('savedScript');
  if (savedScript) textarea.value = savedScript;
});

document.getElementById('injectButton').addEventListener('click', async () => {
  const code = document.getElementById('scriptInput').value;
  await chrome.storage.local.set({ savedScript: code });

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (code.startsWith('ptsiw://')) {
      const command = code.split('://')[1];
      switch (command) {
        case 'mu':
          await applyTheme('material-you');
          break;
        case 'rainbow':
          await applyTheme('rainbow');
          break;
        case 'old':
          await applyTheme('old');
          break;
        case 'test':
          await injectDVDAnimation();
          break;
        default:
          throw new Error('Not found this command, sowwy..');
      }
      alert(`Command "${command}" injected!`);
      return;
    }

    const isJavaScript = !code.trim().startsWith('<') && !code.includes('{');
    const isHTML = code.trim().startsWith('<');
    const isCSS = code.trim().includes('{') && code.trim().includes('}');

    if (isJavaScript) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (code) => {
          const func = new Function(code);
          func();
        },
        args: [code]
      });
    } else if (isHTML) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (code) => {
          document.body.insertAdjacentHTML('beforeend', code);
        },
        args: [code]
      });
    } else if (isCSS) {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (code) => {
          const style = document.createElement('style');
          style.textContent = code;
          document.head.appendChild(style);
        },
        args: [code]
      });
    } else {
      throw new Error('Unsupported lang.');
    }

    alert('Injected!');
  } catch (error) {
    alert(`E: ${error.message}`);
  }
});

async function applyTheme(theme) {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  let css = '';
  switch (theme) {
    case 'material-you':
      css = `
        body {
          background: #1e1e1e;
          color: #e0e0e0;
          font-family: 'Roboto', sans-serif;
        }
        a {
          color: #90caf9;
        }
      `;
      break;
    case 'rainbow':
      css = `
        body {
          animation: rainbow 10s infinite;
        }
        @keyframes rainbow {
          0% { background: #ff0000; }
          14% { background: #ff7f00; }
          28% { background: #ffff00; }
          42% { background: #00ff00; }
          57% { background: #0000ff; }
          71% { background: #4b0082; }
          85% { background: #9400d3; }
          100% { background: #ff0000; }
        }
      `;
      break;
    case 'old':
      css = '';
      break;
  }

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (css) => {
      const style = document.createElement('style');
      style.textContent = css;
      document.head.appendChild(style);
    },
    args: [css]
  });
}

async function injectDVDAnimation() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  const dvdCode = `
    <style>
      body {
        margin: 0;
        overflow: hidden;
        height: 100vh;
        background: #000;
      }
      #dvd {
        position: absolute;
        color: white;
        font-family: Arial, sans-serif;
        font-size: 48px;
        font-weight: bold;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
        white-space: nowrap;
        transition: color 0.3s ease;
      }
    </style>
    <div id="dvd">DVD</div>
    <script>
      const dvd = document.getElementById('dvd');
      let posX = 0;
      let posY = 0;
      let speedX = 2;
      let speedY = 2;
      let hue = 0;

      function getRandomColor() {
        hue = (hue + 30) % 360;
        return \`hsl(\${hue}, 100%, 50%)\`;
      }

      function updatePosition() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const dvdWidth = dvd.offsetWidth;
        const dvdHeight = dvd.offsetHeight;

        if (posX + dvdWidth >= screenWidth || posX <= 0) {
          speedX = -speedX * 1.02;
          dvd.style.color = getRandomColor();
        }
        if (posY + dvdHeight >= screenHeight || posY <= 0) {
          speedY = -speedY * 1.02;
          dvd.style.color = getRandomColor();
        }

        posX += speedX;
        posY += speedY;

        dvd.style.transform = \`translate(\${posX}px, \${posY}px)\`;
        requestAnimationFrame(updatePosition);
      }

      function init() {
        posX = Math.random() * (window.innerWidth - dvd.offsetWidth);
        posY = Math.random() * (window.innerHeight - dvd.offsetHeight);
        dvd.style.color = getRandomColor();
        updatePosition();
      }

      window.onload = init;
      window.onresize = init;
    <\/script>
  `;

  await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (code) => {
      document.body.insertAdjacentHTML('beforeend', code);
    },
    args: [dvdCode]
  });
}