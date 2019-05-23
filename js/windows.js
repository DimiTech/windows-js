(() => {
  class Window {
    constructor(domElement, options) {
      this.domElement = domElement
      const {
        x,
        y,
        width,
        height
      } = options
      this.setX(x)
      this.setY(y)
      this.setWidth(width)
      this.setHeight(height)
    }

    setX(x) {
      this.x = x
      this.domElement.style.left = x + 'px'
    }
    setY(y) {
      this.y = y
      this.domElement.style.top = y + 'px'
    }
    setWidth(width) {
      this.width = width
      this.domElement.style.width  = this.width  + 'px'
    }
    setHeight(height) {
      this.height = height
      this.domElement.style.height = this.height + 'px'
    }
  }

  const WINDOW_CLASS_IDENTIFIER = 'js-window'
  const WINDOWS = Array.from(document.getElementsByClassName(WINDOW_CLASS_IDENTIFIER))
    .map(w => new Window(w, w.dataset))

  drawWindows(WINDOWS)

  function drawWindows(windows) {
    console.log(windows)
  }
})()