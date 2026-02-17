declare namespace Htmx {
  interface HtmxAfterSwapEvent extends CustomEvent {
    detail: {
      elt: HTMLElement;
      target: HTMLElement;
      requestConfig: object;
      successful: boolean;
    };
  }
}

declare global {
  interface HTMLElementEventMap {
    "htmx:afterSwap": Htmx.HtmxAfterSwapEvent;
  }
}

interface HtmxResponseErrorDetail {
  xhr: XMLHttpRequest;
  target: Element;
  requestConfig: any;
  etc: any;
  pathInfo: any;
  elt: Element;
}

interface HtmxAfterRequestDetail {
  xhr: XMLHttpRequest;
  target: Element;
  successful: boolean;
  failed: boolean;
}

declare global {
  interface DocumentEventMap {
    "htmx:responseError": CustomEvent<HtmxResponseErrorDetail>;
    "htmx:afterRequest": CustomEvent<HtmxAfterRequestDetail>;
  }
}

export {};
