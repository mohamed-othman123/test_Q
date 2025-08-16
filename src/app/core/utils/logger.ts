export function logAppVersion(version: string) {
  const labelStyle = [
    'color: white',
    'background: #007ACC',
    'padding: 2px 6px',
    'border-radius: 3px',
    'font-weight: bold',
  ].join(';');
  const versionStyle = [
    'color: #007ACC',
    'background: #EEE',
    'padding: 2px 4px',
    'border-radius: 3px',
    'margin-right:5px',
  ].join(';');

  console.log('%cVersion%c ' + version, labelStyle, versionStyle);
}
