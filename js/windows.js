(() => {
  const WINDOW_CLASS_IDENTIFIER = 'js-window'

  class WindowManager {
    constructor() {
      this.windows = []
      
      Array.from(document.getElementsByClassName(WINDOW_CLASS_IDENTIFIER))
        .forEach(w => this.addWindow(w))
    }

    addWindow(window) {
      this.windows.push(new Window(
        this,
        window,
        this.windows.length + 1,
        window.dataset
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

      // DOM Elements
      this.domElement = domElement
      this.titleDomElement = domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-title`)[0]

      const {
        x,
        y,
        width,
        height
      } = dataset

      // Positioning
      this.setX(parseInt(x))
      this.setY(parseInt(y))
      this.setWidth(parseInt(width))
      this.setHeight(parseInt(height))
      this.setZIndex(parseInt(zIndex))

      // Events
      this.isMouseDown = false
      this.addEventListeners()
    }

    addEventListeners() {
      // Focusing the window
      this.domElement.addEventListener('mousedown', e => {
        this.windowManager.focusOnWindow(this)
      })

      // Title dragging
      document.addEventListener('mouseup', e => { // This one is global
        this.isMouseDown = false
      })
      this.titleDomElement.addEventListener('mousedown', e => {
        this.isMouseDown = true
        this.mouseDx = e.clientX - this.x
        this.mouseDy = e.clientY - this.y
      })
      document.addEventListener('mousemove', e => {  // This one is global
        if (this.isMouseDown) {
          this.setX(e.clientX - this.mouseDx)
          this.setY(e.clientY - this.mouseDy)
        }
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

  //////////////////////////////////////////////////////////////////////////////
  // Published API
  //////////////////////////////////////////////////////////////////////////////

  function addWindow(windowModel) {
    const windowDomElement = document.createElement('div')
    windowDomElement.setAttribute('class', WINDOW_CLASS_IDENTIFIER)
    windowDomElement.setAttribute('data-width',  windowModel.w)
    windowDomElement.setAttribute('data-height', windowModel.h)
    windowDomElement.setAttribute('data-x', windowModel.x)
    windowDomElement.setAttribute('data-y', windowModel.y)

    const windowTitleDomElement = document.createElement('div')
    windowTitleDomElement.setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-title`)
    windowTitleDomElement.textContent = windowModel.title || ''
    windowDomElement.appendChild(windowTitleDomElement)

    document.body.appendChild(windowDomElement)
    windowManager.addWindow(windowDomElement)

    // Returned API
    return {
      // destroy()
    }
  }

  global.WINDOWS_JS = {
    addWindow,
  }
})(global = window)