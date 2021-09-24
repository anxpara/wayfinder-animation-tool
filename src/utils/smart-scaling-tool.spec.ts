import { getSmartScaleParams, getSmartUnscaleParams } from "./smart-scaling-tool";

describe("getSmartScaleParams", () => {
  /** left: 10, right: 90, width: 80
   * top: 20, bottom: 92, height: 72 */
  let container = new DOMRect(10, 20, 80, 72);
  /** left: 20, right: 40, width: 20
   * top: 30, bottom: 60, height: 30 */
  let rect = new DOMRect(20, 30, 20, 30);
  /** left: 15, right: 35, width: 20
   * top: 22, bottom: 42, height: 32 */
  let rectNearTopLeft = new DOMRect(15, 22, 20, 32);
  /** left: 65, right: 85, width: 20
   * top: 56, bottom: 88, height: 32 */
  let rectNearBottomRight = new DOMRect(65, 56, 20, 32);
  /** left: 20, right: 60, width: 40
   * top: 28, bottom: 54, height: 36 */
  let rectHalfSize = new DOMRect(20, 28, 40, 36);
  /** left: 40, right: 80, width: 40
   * top: 30, bottom: 40, height: 10 */
  let rectHalfWidth = new DOMRect(40, 30, 40, 10);
  /** left: 40, right: 50, width: 10
   * top: 50, bottom: 86, height: 36 */
  let rectHalfHeight = new DOMRect(40, 50, 10, 36);

  describe("scale = 1", () => {
    it("should not scale", () => {
      let params = getSmartScaleParams(rect, 1, container);
      expect(params.scale).toEqual(1);
    });
  });

  describe("scale > 1, no size clamp needed", () => {
    it("shouldnt translate if still inside", () => {
      let params = getSmartScaleParams(rect, 1.2, container);
      let expectedParams = {
        scale: 1.2,
        translateX: 0,
        translateY: 0,
      };
      expect(params).toEqual(expectedParams);
    });

    it("should translate down and right when outside left and top", () => {
      let params = getSmartScaleParams(rectNearTopLeft, 2, container);
      let expectedParams = {
        scale: 2,
        translateX: 5,
        translateY: 14,
      };
      expect(params).toEqual(expectedParams);
    });

    it("should translate up and left when outside bottom and right", () => {
      let params = getSmartScaleParams(rectNearBottomRight, 2, container);
      let expectedParams = {
        scale: 2,
        translateX: -5,
        translateY: -12,
      };
      expect(params).toEqual(expectedParams);
    });
  });

  describe("scale > 1, size clamp needed", () => {
    it("should clamp width and translate left", () => {
      let params = getSmartScaleParams(rectHalfWidth, 5, container);
      let expectedParams = {
        scale: 2,
        translateX: -10,
        translateY: 0,
      };
      expect(params).toEqual(expectedParams);
    });

    it("should clamp height and translate up", () => {
      let params = getSmartScaleParams(rectHalfHeight, 5, container);
      let expectedParams = {
        scale: 2,
        translateX: 0,
        translateY: -12,
      };
      expect(params).toEqual(expectedParams);
    });

    it("should clamp rect with same dimensions exactly", () => {
      let params = getSmartScaleParams(rectHalfSize, 5, container);
      let expectedParams = {
        scale: 2,
        translateX: 10,
        translateY: 10,
      };
      expect(params).toEqual(expectedParams);
    });
  });

  describe("scale < 1", () => {
    it("scales correctly", () => {
      let params = getSmartScaleParams(rect, 0.5, container);
      let expectedParams = {
        scale: 0.5,
        translateX: 0,
        translateY: 0,
      };
      expect(params).toEqual(expectedParams);
    });
  });
});

describe("getSmartUnscaleParams", () => {
  it("should return default scale and translate params", () => {
    let params = getSmartUnscaleParams();

    expect(Object.keys(params)).toContain("complete");
    delete params.complete;

    let defaultParams = {
      scale: 1,
      translateX: 0,
      translateY: 0,
    };
    expect(params).toEqual(defaultParams);
  });
});

describe("smart scale origin tracking", () => {
  it("remembers an id until the associated rectangle has getSmartUnscaleParams(id).complete() called", () => {
    let container = new DOMRect(0, 0, 30, 30);
    let originalRect = new DOMRect(-5, -5, 20, 20);
    let differentRect = new DOMRect(-10, -10, 20, 20);

    // set original
    let firstParams = getSmartScaleParams(originalRect, 1, container, "origianalId");

    // check original used instead of different one
    let secondParams = getSmartScaleParams(differentRect, 1, container, "origianalId");
    expect(secondParams).toEqual(firstParams);

    // reset id
    getSmartUnscaleParams("originalId").complete!();

    // check that different one is used
    let thirdParams = getSmartScaleParams(differentRect, 1, container, "originalId");
    expect(thirdParams).not.toEqual(firstParams);
  });
});
