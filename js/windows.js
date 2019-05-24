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
        'N': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-n`)[0],
          isMouseDown: false,
          moveHandler: e => {
            const newY = e.clientY
            const newHeight = this.y + this.height - newY
            if (newHeight >= Window.MIN_HEIGHT) {
              this.setHeight(newHeight)
              this.setY(newY)
            }
            else {
              this.setY(this.y + this.height - Window.MIN_HEIGHT)
              this.setHeight(Window.MIN_HEIGHT)
            }
          },
        },
        'NE': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-ne`)[0],
          isMouseDown: false,
        },
        'E': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-e`)[0],
          isMouseDown: false,
          moveHandler: e => {
            const newWidth = e.clientX - this.x
            this.setWidth(newWidth)
          },
        },
        'SE': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-se`)[0],
          isMouseDown: false,
        },
        'S': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-s`)[0],
          isMouseDown: false,
          moveHandler: e => {
            const newHeight = e.clientY - this.y
            this.setHeight(newHeight)
          },
        },
        'SW': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-sw`)[0],
          isMouseDown: false,
        },
        'W': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-w`)[0],
          isMouseDown: false,
          moveHandler: e => {
            const newX = e.clientX
            const newWidth = this.x + this.width - newX
            if (newWidth >= Window.MIN_WIDTH) {
              this.setWidth(newWidth)
              this.setX(newX)
            }
            else {
              this.setX(this.x + this.width - Window.MIN_WIDTH)
              this.setWidth(Window.MIN_WIDTH)
            }
          },
        },
        'NW': { 
          domElement: this.domElement.getElementsByClassName(`${WINDOW_CLASS_IDENTIFIER}-handle-nw`)[0],
          isMouseDown: false,
        },
      }

      // Events
      this.isMouseDownOnCloseBtn = false
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
        this.isMouseDownOnCloseBtn = false
        if (this.btnCloseDomElement.style.backgroundImage !== 'url(./img/win-98_close_btn.png)') {
          this.btnCloseDomElement.style.backgroundImage = 'url(./img/win-98_close_btn.png)'
        }
        this.resizeHandles['N' ].isMouseDown = false
        this.resizeHandles['NE'].isMouseDown = false
        this.resizeHandles['E' ].isMouseDown = false
        this.resizeHandles['SE'].isMouseDown = false
        this.resizeHandles['S' ].isMouseDown = false
        this.resizeHandles['SW'].isMouseDown = false
        this.resizeHandles['W' ].isMouseDown = false
        this.resizeHandles['NW'].isMouseDown = false
      })
      this.titleDomElement.addEventListener('mousedown', e => {
        this.isMouseDownOnTitle = true
        this.mouseDx = e.clientX - this.x
        this.mouseDy = e.clientY - this.y
      })
      document.addEventListener('mousemove', e => { // This one is global
        // Title handler
        if (this.isMouseDownOnTitle && this.isMouseDownOnCloseBtn === false) {
          this.setX(e.clientX - this.mouseDx)
          this.setY(e.clientY - this.mouseDy)
        }

        // Resize handlers
        if (this.resizeHandles['N'].isMouseDown) {
          this.resizeHandles['N'].moveHandler(e)
        }
        if (this.resizeHandles['NE'].isMouseDown) {
          this.resizeHandles['N'].moveHandler(e)
          this.resizeHandles['E'].moveHandler(e)
        }
        if (this.resizeHandles['E'].isMouseDown) {
          this.resizeHandles['E'].moveHandler(e)
        }
        if (this.resizeHandles['SE'].isMouseDown) {
          this.resizeHandles['S'].moveHandler(e)
          this.resizeHandles['E'].moveHandler(e)
        }
        if (this.resizeHandles['S'].isMouseDown) {
          this.resizeHandles['S'].moveHandler(e)
        }
        if (this.resizeHandles['SW'].isMouseDown) {
          this.resizeHandles['S'].moveHandler(e)
          this.resizeHandles['W'].moveHandler(e)
        }
        if (this.resizeHandles['W'].isMouseDown) {
          this.resizeHandles['W'].moveHandler(e)
        }
        if (this.resizeHandles['NW'].isMouseDown) {
          this.resizeHandles['N'].moveHandler(e)
          this.resizeHandles['W'].moveHandler(e)
        }
      })

      // Control buttons
      this.btnCloseDomElement.addEventListener('mousedown', e => {
        this.isMouseDownOnCloseBtn = true
        this.btnCloseDomElement.style.backgroundImage = 'url(./img/win-98_close_btn_pressed.png)'
      })
      this.btnCloseDomElement.addEventListener('click', e => {
        this.windowManager.destroyWindow(this)
      })

      // Resize handlers
      this.resizeHandles['N'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['N'].isMouseDown = true
      })
      this.resizeHandles['NE'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['NE'].isMouseDown = true
      })
      this.resizeHandles['E'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['E'].isMouseDown = true
      })
      this.resizeHandles['SE'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['SE'].isMouseDown = true
      })
      this.resizeHandles['S'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['S'].isMouseDown = true
      })
      this.resizeHandles['SW'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['SW'].isMouseDown = true
      })
      this.resizeHandles['W'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['W'].isMouseDown = true
      })
      this.resizeHandles['NW'].domElement.addEventListener('mousedown', e => {
        this.resizeHandles['NW'].isMouseDown = true
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

    setX(x) {
      this.x = x
      this.domElement.style.left = x + 'px'
    }
    setY(y) {
      this.y = y
      this.domElement.style.top = y + 'px'
    }
    setWidth(width) {
      if (width <= Window.MIN_WIDTH) {
        width = Window.MIN_WIDTH
      }
      this.width = width
      this.domElement.style.width  = this.width  + 'px'
    }
    setHeight(height) {
      if (height <= Window.MIN_HEIGHT) {
        height = Window.MIN_HEIGHT
      }
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

    const windowTitleTextDomElement = document.createElement('span')
    windowTitleTextDomElement.setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-title-text`)
    windowTitleTextDomElement.textContent = windowModel.title || ''

    const controlBtnClose = document.createElement('span')
    controlBtnClose.setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-btn-close`)

    windowTitleDomElement.appendChild(windowTitleTextDomElement)
    windowTitleDomElement.appendChild(controlBtnClose)


    const resizeHandleDomElements = {
      'N'  : document.createElement('div'),
      'NE' : document.createElement('div'),
      'E'  : document.createElement('div'),
      'SE' : document.createElement('div'),
      'S'  : document.createElement('div'),
      'SW' : document.createElement('div'),
      'W'  : document.createElement('div'),
      'NW' : document.createElement('div'),
    }
    resizeHandleDomElements['N' ].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-n`)
    resizeHandleDomElements['NE'].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-ne`)
    resizeHandleDomElements['E' ].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-e`)
    resizeHandleDomElements['SE'].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-se`)
    resizeHandleDomElements['S' ].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-s`)
    resizeHandleDomElements['SW'].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-sw`)
    resizeHandleDomElements['W' ].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-w`)
    resizeHandleDomElements['NW'].setAttribute('class', `${WINDOW_CLASS_IDENTIFIER}-handle-nw`)

    windowDomElement.appendChild(windowTitleDomElement)
    windowDomElement.appendChild(resizeHandleDomElements['N' ])
    windowDomElement.appendChild(resizeHandleDomElements['NE'])
    windowDomElement.appendChild(resizeHandleDomElements['E' ])
    windowDomElement.appendChild(resizeHandleDomElements['SE'])
    windowDomElement.appendChild(resizeHandleDomElements['S' ])
    windowDomElement.appendChild(resizeHandleDomElements['SW'])
    windowDomElement.appendChild(resizeHandleDomElements['W' ])
    windowDomElement.appendChild(resizeHandleDomElements['NW'])

    document.body.appendChild(windowDomElement)
    windowManager.addWindow(windowDomElement)

    // Returned API
    return {
      // destroy() {
      // TODO: Maybe implement this?
      // }
    }
  }

  global.WINDOWS_JS = {
    addWindow,
  }
})(global = window)
