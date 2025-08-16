// This is a workaround for a known issue with passive event listeners
// that may conflict with Angular CDK drag and drop.
// It makes sure that 'mousemove' and 'wheel' events are not treated as passive.
(function () {
  if (
    typeof window !== 'undefined' &&
    typeof window.addEventListener === 'function'
  ) {
    const events = ['mousemove', 'wheel'];
    events.forEach((eventName) => {
      document.addEventListener(eventName, () => {}, {
        passive: false,
        capture: true,
      });
    });
  }
})();
