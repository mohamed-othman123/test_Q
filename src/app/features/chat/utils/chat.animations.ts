import { trigger, state, style, transition, animate, keyframes } from '@angular/animations';

export const chatAnimations = [
  // Fade in and slide up animation for messages
  trigger('fadeInUp', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px) scale(0.95)'
      }),
      animate('300ms cubic-bezier(0.4, 0, 0.2, 1)', style({
        opacity: 1,
        transform: 'translateY(0) scale(1)'
      }))
    ])
  ]),

  // Slide down animation for dropdowns
  trigger('slideDown', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(-10px)'
      }),
      animate('200ms ease-out', style({
        opacity: 1,
        transform: 'translateY(0)'
      }))
    ]),
    transition(':leave', [
      animate('200ms ease-in', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      }))
    ])
  ]),

  // Pulse animation for loading states
  trigger('pulse', [
    state('in', style({ transform: 'scale(1)' })),
    transition('* => *', [
      animate('1s ease-in-out', keyframes([
        style({ transform: 'scale(1)', opacity: 1, offset: 0 }),
        style({ transform: 'scale(1.05)', opacity: 0.8, offset: 0.5 }),
        style({ transform: 'scale(1)', opacity: 1, offset: 1 })
      ]))
    ])
  ]),

  // Bounce animation for buttons
  trigger('bounce', [
    transition(':enter', [
      style({ transform: 'scale(0)' }),
      animate('400ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        style({ transform: 'scale(1)' })
      )
    ])
  ]),

  // Shake animation for errors
  trigger('shake', [
    transition('* => *', [
      animate('500ms ease-in-out', keyframes([
        style({ transform: 'translateX(0)', offset: 0 }),
        style({ transform: 'translateX(-10px)', offset: 0.1 }),
        style({ transform: 'translateX(10px)', offset: 0.2 }),
        style({ transform: 'translateX(-10px)', offset: 0.3 }),
        style({ transform: 'translateX(10px)', offset: 0.4 }),
        style({ transform: 'translateX(-10px)', offset: 0.5 }),
        style({ transform: 'translateX(10px)', offset: 0.6 }),
        style({ transform: 'translateX(-10px)', offset: 0.7 }),
        style({ transform: 'translateX(10px)', offset: 0.8 }),
        style({ transform: 'translateX(0)', offset: 1 })
      ]))
    ])
  ]),

  // Typing indicator animation
  trigger('typing', [
    state('active', style({ opacity: 1 })),
    state('inactive', style({ opacity: 0.3 })),
    transition('active <=> inactive', animate('600ms ease-in-out'))
  ])
];
