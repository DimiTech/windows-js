(() => {
  const WINDOW_CLASS_IDENTIFIER = 'js-window'

  class WindowManager {
    constructor() {
      this.windows = []
      
      Array.from(document.getElementsByClassName(WINDOW_CLASS_IDENTIFIER))
        .forEach(w => this.addWindow(w))
    }

    addWindow(w) {
      this.windows.push(new Window(
        this,
        w,
        this.windows.length + 1,
        w.dataset
      ))
    }

    focusOnWindow(window) {
      const maxZIndex = this.getTopmostWindowZIndex()
      this.windows.forEach(w => {
        if (w === window) {
          w.setZIndex(maxZIndex)
        }
        else {
          w.decrementZIndex()
        }
      })
    }

    getTopmostWindowZIndex() {
      return this.windows.reduce((maxZIndex, currentWindow) => {
        return Math.max(maxZIndex, currentWindow.zIndex)
      }, -Infinity)
    }
  }

  class Window {
    constructor(windowManager, domElement, zIndex, dataset) {
      this.windowManager = windowManager
      this.domElement = domElement
      const {
        x,
        y,
        width,
        height
      } = dataset
      this.setX(x)
      this.setY(y)
      this.setWidth(width)
      this.setHeight(height)
      this.setZIndex(zIndex)
      this.addEventListeners()
    }

    addEventListeners() {
      this.domElement.addEventListener('click', e => {
        this.windowManager.focusOnWindow(this)
      })
    }

    setZIndex(zIndex) {
      this.zIndex = zIndex
      this.domElement.style.zIndex = this.zIndex
    }

    decrementZIndex() {
      --this.zIndex
      this.domElement.style.zIndex = this.zIndex
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

  const windowManager = new WindowManager()

})()