(() => {
  const WINDOW_CLASS_IDENTIFIER = 'js-window'

  class WindowManager {
    constructor() {
      this.windows = []
      
      Array.from(document.getElementsByClassName(WINDOW_CLASS_IDENTIFIER))
        .forEach(w => this.addWindow(w))
    }

    addWindow(windowDomElement) {
      const window = new Window(
        this,
        windowDomElement,
        this.windows.length, // z-indexes match the position of the window in the array
        windowDomElement.dataset
      )
      this.windows.push(window)
      this.focusOnWindow(window)
    }

    destroyWindow(window) {
      this.windows = this.windows.filter(w => w !== window)
      window.destroy()

      // Focus on window with maximum z-index
      if (this.windows.length > 0) {
        const topmostWindow = this.getWindowWithMaxZIndex()
        this.focusOnWindow(topmostWindow)
      }
    }

    focusOnWindow(window) {
      if (this.windows.length === 0) {
        window.setFocused(true)
        return
      }
      const { zIndex: maxZIndex } = this.getWindowWithMaxZIndex()
      window.zIndex = maxZIndex + 1
      this.windows
        .sort((w1, w2) => {
          return w1.zIndex < w2.zIndex ? -1 : 1
        })
        .forEach((w, i) => {
          w.setZIndex(i) // z-indexes match the position of the window in the array
          if (i === this.windows.length - 1) {
            w.setFocused(true)
          }
          else {
            w.setFocused(false)
          }
        })
    }

    getWindowWithMaxZIndex() {
      return this.windows.reduce((topmostWindow, currentWindow) => {
        if (topmostWindow.zIndex > currentWindow.zIndex) {
          return topmostWindow
        }
        else {
          return currentWindow
        }
      }, this.windows[0])
    }
  }

  class Window {
    static MIN_WIDTH  = 100
    static MIN_HEIGHT = 100

    constructor(windowManager, domElement, zIndex, dataset) {
      this.windowManager = windowManager

      // DOM Elements
      this.domElement = domElement
      this.titleDomElement = domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-title`)[0]
      this.btnCloseDomElement = this.titleDomElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-btn-close`)[0]

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

      this.resizeHandles = {
        'E': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-e`)[0],
          isMouseDown: false,
        }
      }

      // Events
      this.isMouseDownOnTitle = false
      this.addEventListeners()
    }

    destroy() {
      this.domElement.parentNode.removeChild(this.domElement)
    }

    addEventListeners() {
      // Focusing the window
      this.domElement.addEventListener('mousedown', e => {
        this.windowManager.focusOnWindow(this)
      })

      // Title dragging
      document.addEventListener('mouseup', e => { // This one is global
        this.isMouseDownOnTitle = false
        this.btnCloseDomElement.style.borderStyle = 'outset'
        this.resizeHandles['E'].isMouseDown = false
      })
      this.titleDomElement.addEventListener('mousedown', e => {
        this.isMouseDownOnTitle = true
        this.mouseDx = e.clientX - this.x
        this.mouseDy = e.clientY - this.y
      })
      document.addEventListener('mousemove', e => {  // This one is global
        if (this.isMouseDownOnTitle) {
          this.setX(e.clientX - this.mouseDx)
          this.setY(e.clientY - this.mouseDy)
        }
        if (this.resizeHandles['E'].isMouseDown) {
          const newWidth = e.clientX - this.x
          if (newWidth >= Window.MIN_WIDTH) {
            this.setWidth(newWidth)
          }
          else {
            this.setWidth(Window.MIN_WIDTH)
          }
        }
      })

      // Control buttons
      this.btnCloseDomElement.addEventListener('mousedown', e => {
        this.btnCloseDomElement.style.borderStyle = 'inset'
      })
      this.btnCloseDomElement.addEventListener('click', e => {
        this.windowManager.destroyWindow(this)
      })

      // Resize handlers
      this.resizeHandles['E'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['E'].isMouseDown = true
      })
    }

    setZIndex(zIndex) {
      this.zIndex = zIndex
      this.domElement.style.zIndex = this.zIndex
    }
    setFocused(isFocused) {
      if (isFocused) {
        this.titleDomElement.classList.add(`${WINDOW_CLASS_IDENTIFIER}-title-focused`)
      }
      else {
        this.titleDomElement.classList.remove(`${WINDOW_CLASS_IDENTIFIER}-title-focused`)
      }
    }

    // decrementZIndex() {
    //   --this.zIndex
    //   this.domElement.style.zIndex = this.zIndex
    // }

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

    const controlBtnClose = document.createElement('span')
    controlBtnClose.textContent = 'x'
    controlBtnClose.setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-btn-close`)

    windowTitleDomElement.appendChild(controlBtnClose)


    const resizeHandleDomElements = {
      'E': document.createElement('div')
    }
    resizeHandleDomElements['E'].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-e`)

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