(() => {
  const trigger = document.querySelector('#engineBadge');
  const dialog = document.querySelector('#jsbsimInfo');
  const close = dialog?.querySelector('[data-dialog-close]');

  if (!trigger || !(dialog instanceof HTMLDialogElement)) return;

  trigger.addEventListener('click', () => {
    if (!dialog.open) dialog.showModal();
  });
  close?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
})();
