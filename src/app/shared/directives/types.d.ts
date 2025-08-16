declare module 'vanilla-icon-picker' {
  interface IconPickerOptions {
    theme?: 'default' | 'bootstrap-5';
    iconSource?:
      | string[]
      | Array<{
          key: string;
          prefix: string;
          url: string;
        }>;
    closeOnSelect?: boolean;
    defaultValue?: string | null;
    i18n?: {
      'input:placeholder'?: string;
      'text:title'?: string;
      'text:empty'?: string;
      'btn:save'?: string;
    };
  }

  interface IconPickerInstance {
    value: string;
    name: string;
    svg?: string;
    unicode?: string;
  }

  class IconPicker {
    constructor(element: HTMLElement | string, options?: IconPickerOptions);

    on(event: string, callback: (instance: IconPickerInstance) => void): void;

    off(event: string, callback: (instance: IconPickerInstance) => void): void;

    open(): void;

    hide(): void;

    clear(): void;

    isOpen(): boolean;

    destroy(deleteInstance?: boolean): void;
  }

  export default IconPicker;
}
