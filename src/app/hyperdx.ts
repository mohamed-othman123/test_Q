import HyperDX from '@hyperdx/browser';
import {environment} from './environments/environment';

export const initHyperDX = () =>
  HyperDX.init({
    apiKey: environment.apiKey,
    url: environment.url,
    service: environment.service,
    tracePropagationTargets: [environment.baseUrl],
    consoleCapture: true,
    advancedNetworkCapture: true,
  });
