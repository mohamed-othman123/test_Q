import {
  animate,
  keyframes,
  state,
  style,
  transition,
  trigger,
  query,
  stagger,
  group,
} from '@angular/animations';

export const shakeAnimation = trigger('shakeit', [
  state(
    'shakestart',
    style({
      transform: 'scale(1)',
    }),
  ),
  state(
    'shakeend',
    style({
      transform: 'scale(1)',
    }),
  ),
  transition(
    'shakestart => shakeend',
    animate(
      '1000ms ease-in',
      keyframes([
        style({transform: 'translate3d(-1px, 0, 0)', offset: 0.1}),
        style({transform: 'translate3d(2px, 0, 0)', offset: 0.2}),
        style({transform: 'translate3d(-4px, 0, 0)', offset: 0.3}),
        style({transform: 'translate3d(4px, 0, 0)', offset: 0.4}),
        style({transform: 'translate3d(-4px, 0, 0)', offset: 0.5}),
        style({transform: 'translate3d(4px, 0, 0)', offset: 0.6}),
        style({transform: 'translate3d(-4px, 0, 0)', offset: 0.7}),
        style({transform: 'translate3d(2px, 0, 0)', offset: 0.8}),
        style({transform: 'translate3d(-1px, 0, 0)', offset: 0.9}),
      ]),
    ),
  ),
]);

// Analytics specific animations
export const fadeInUp = trigger('fadeInUp', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(30px)',
    }),
    animate(
      '600ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({
        opacity: 1,
        transform: 'translateY(0)',
      }),
    ),
  ]),
]);

export const slideInFromLeft = trigger('slideInFromLeft', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateX(-50px)',
    }),
    animate(
      '500ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({
        opacity: 1,
        transform: 'translateX(0)',
      }),
    ),
  ]),
]);

export const slideInFromRight = trigger('slideInFromRight', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateX(50px)',
    }),
    animate(
      '500ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({
        opacity: 1,
        transform: 'translateX(0)',
      }),
    ),
  ]),
]);

export const scaleIn = trigger('scaleIn', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'scale(0.8)',
    }),
    animate(
      '400ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({
        opacity: 1,
        transform: 'scale(1)',
      }),
    ),
  ]),
]);

export const staggerCards = trigger('staggerCards', [
  transition(':enter', [
    query('.analytics-card', [
      style({
        opacity: 0,
        transform: 'translateY(30px)',
      }),
      stagger(100, [
        animate(
          '500ms cubic-bezier(0.4, 0, 0.2, 1)',
          style({
            opacity: 1,
            transform: 'translateY(0)',
          }),
        ),
      ]),
    ]),
  ]),
]);

export const cardHover = trigger('cardHover', [
  state('hover', style({
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
  })),
  state('default', style({
    transform: 'translateY(0) scale(1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  })),
  transition('default => hover', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
  transition('hover => default', animate('300ms cubic-bezier(0.4, 0, 0.2, 1)')),
]);

export const shimmer = trigger('shimmer', [
  state('loading', style({
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
  })),
  state('loaded', style({
    background: 'transparent',
  })),
  transition('loading => loaded', animate('300ms ease-out')),
]);

export const pulseGlow = trigger('pulseGlow', [
  state('active', style({
    boxShadow: '0 0 20px rgba(30, 170, 143, 0.4)',
    transform: 'scale(1.05)',
  })),
  state('inactive', style({
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transform: 'scale(1)',
  })),
  transition('inactive => active', animate('300ms ease-in-out')),
  transition('active => inactive', animate('300ms ease-in-out')),
]);

export const slideInFromBottom = trigger('slideInFromBottom', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'translateY(50px)',
    }),
    animate(
      '600ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({
        opacity: 1,
        transform: 'translateY(0)',
      }),
    ),
  ]),
]);

export const rotateIn = trigger('rotateIn', [
  transition(':enter', [
    style({
      opacity: 0,
      transform: 'rotate(-10deg) scale(0.8)',
    }),
    animate(
      '500ms cubic-bezier(0.4, 0, 0.2, 1)',
      style({
        opacity: 1,
        transform: 'rotate(0deg) scale(1)',
      }),
    ),
  ]),
]);
