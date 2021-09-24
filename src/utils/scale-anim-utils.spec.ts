import {
  getScaleToFitContainerParam,
  scaleRectangle,
} from './scale-anim-utils';

describe('scaleRectangle', () => {
  let rect: DOMRect = new DOMRect(20, 120, 20, 40);

  it('should scale up', () => {
    let scaledRect = scaleRectangle(rect, 2);
    expect(scaledRect.x).toEqual(10);
    expect(scaledRect.y).toEqual(100);
    expect(scaledRect.width).toEqual(40);
    expect(scaledRect.height).toEqual(80);
  });

  it('should scale down', () => {
    let scaledRect = scaleRectangle(rect, 0.5);
    expect(scaledRect.x).toEqual(25);
    expect(scaledRect.y).toEqual(130);
    expect(scaledRect.width).toEqual(10);
    expect(scaledRect.height).toEqual(20);
  });
});

describe('getScaleToFitContainerParam', () => {
  it('scales up to tighter x axis', () => {
    let rect = new DOMRect(0, 0, 90, 50);
    let container = new DOMRect(0, 0, 100, 140);
    expect(getScaleToFitContainerParam(rect, container).scale).toEqual(
      100 / 90
    );
  });

  it('scales up to tighter y axis', () => {
    let rect = new DOMRect(0, 0, 50, 90);
    let container = new DOMRect(0, 0, 140, 100);
    expect(getScaleToFitContainerParam(rect, container).scale).toEqual(
      100 / 90
    );
  });

  it('scales down to tighter x axis', () => {
    let rect = new DOMRect(0, 0, 60, 80);
    let container = new DOMRect(0, 0, 40, 20);
    expect(getScaleToFitContainerParam(rect, container).scale).toEqual(20 / 80);
  });

  it('scales down to tighter y axis', () => {
    let rect = new DOMRect(0, 0, 80, 60);
    let container = new DOMRect(0, 0, 20, 40);
    expect(getScaleToFitContainerParam(rect, container).scale).toEqual(20 / 80);
  });
});
