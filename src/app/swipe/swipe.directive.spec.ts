import { SwipeDirective } from './swipe.directive';

describe('SwipeDirective', () => {
  it('should create an instance', () => {
    let rendererMock = {
      data: () => {},
      destroy: () => {},
      createElement: () => {},
      createComment: () => {},
      createText: () => {},
      destroyNode: () => {},
      appendChild: () => {},
      insertBefore: () => {},
      removeChild: () => {},
      selectRootElement: () => {},
      parentNode: () => {},
      nextSibling: () => {},
      setAttribute: () => {},
      removeAttribute: () => {},
      addClass: () => {},
      removeClass: () => {},
      setStyle: () => {},
      removeStyle: () => {},
      setProperty: () => {},
      setValue: () => {},
      listen: () => {}
    };

    let elRefMock = {
      nativeElement: document.createElement('div')
    };

    let location = String;
    const directive = new SwipeDirective(rendererMock as any, elRefMock as any, location as any);
    expect(directive).toBeTruthy();
  });
});
