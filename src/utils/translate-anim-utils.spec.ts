import { getTranslateIntoContainerParams } from './translate-anim-utils';

describe('getTranslateIntoContainerParams', () => {
  let container = new DOMRect(20, 120, 60, 80);

  it('doesnt translate if inside', () => {
    let rect = new DOMRect(25, 125, 5, 20);
    let params = getTranslateIntoContainerParams(rect, container);
    expect(params.translateX).toEqual(0);
    expect(params.translateY).toEqual(0);
  });

  it('doesnt translate if equal', () => {
    let params = getTranslateIntoContainerParams(container, container);
    expect(params.translateX).toEqual(0);
    expect(params.translateY).toEqual(0);
  });

  it('translates up & left when too far down & right', () => {
    let rect = new DOMRect(70, 170, 20, 50);
    let params = getTranslateIntoContainerParams(rect, container);
    expect(params.translateX).toEqual(-10);
    expect(params.translateY).toEqual(-20);
  });

  it('translates down & right when too far left & up, even when bottom & right sides are also beyond the container', () => {
    let rect = new DOMRect(0, 0, 100, 220);
    let params = getTranslateIntoContainerParams(rect, container);
    expect(params.translateX).toEqual(20);
    expect(params.translateY).toEqual(120);
  });
});
