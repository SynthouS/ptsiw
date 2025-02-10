window.addEventListener('message', (event) => {
    if (event.data.action === 'execute') {
      try {
        const script = event.data.code;
        const fn = new Function('GM', script);
        
        // Gm api
        const GM = {
          log: console.log.bind(console),
          addStyle: (css) => {
            const style = document.createElement('style');
            style.textContent = css;
            document.head.appendChild(style);
          }
        };
  
        fn(GM);
        event.source.postMessage({ status: 'success' }, '*');
      } catch (e) {
        event.source.postMessage({ status: 'error', message: e.message }, '*');
      }
    }
  });