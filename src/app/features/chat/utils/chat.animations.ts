
import {
  trigger,
  state,
  style,
  transition,
  animate,
  query,
  stagger,
} from '@angular/animations';

export const magicalChatAnimations = [
  trigger('fadeInUp', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateY(30px)' }),
      animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        style({ opacity: 1, transform: 'translateY(0)' })
      )
    ]),
    transition(':leave', [
      animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        style({ opacity: 0, transform: 'translateY(-20px)' })
      )
    ])
  ]),

  trigger('slideIn', [
    transition(':enter', [
      style({ opacity: 0, transform: 'translateX(-20px)' }),
      animate('300ms ease-out',
        style({ opacity: 1, transform: 'translateX(0)' })
      )
    ])
  ]),

  trigger('messageAnimation', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'translateY(20px) scale(0.95)',
        filter: 'blur(4px)'
      }),
      animate('500ms cubic-bezier(0.25, 0.8, 0.25, 1)',
        style({
          opacity: 1,
          transform: 'translateY(0) scale(1)',
          filter: 'blur(0px)'
        })
      )
    ])
  ]),

  trigger('sidebarSlide', [
    state('expanded', style({
      width: '320px',
      opacity: 1
    })),
    state('collapsed', style({
      width: '70px',
      opacity: 0.9
    })),
    transition('expanded <=> collapsed', [
      animate('400ms cubic-bezier(0.4, 0, 0.2, 1)')
    ])
  ]),

  trigger('magicalAppear', [
    transition(':enter', [
      style({
        opacity: 0,
        transform: 'scale(0.8) rotateY(20deg)',
        filter: 'blur(8px)'
      }),
      animate('600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        style({
          opacity: 1,
          transform: 'scale(1) rotateY(0deg)',
          filter: 'blur(0px)'
        })
      )
    ])
  ]),

  trigger('streamingText', [
    state('streaming', style({
      borderRight: '2px solid var(--chat-primary, #667eea)'
    })),
    transition('* => streaming', [
      animate('0ms', style({ borderRight: '2px solid var(--chat-primary, #667eea)' }))
    ])
  ]),

  trigger('listStagger', [
    transition(':enter', [
      query('.stagger-item', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        stagger('100ms', [
          animate('400ms cubic-bezier(0.25, 0.8, 0.25, 1)',
            style({ opacity: 1, transform: 'translateY(0)' })
          )
        ])
      ], { optional: true })
    ])
  ])
];
