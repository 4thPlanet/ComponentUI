class CUI {
  #baseClass
  #attrPrefix
  #styles
  #cssInitialized

  constructor(baseClass = 'component', prefix = 'ui-') {
    this.#baseClass = baseClass
    this.#attrPrefix = prefix
    // TODO: refactor styles into individual classes
    // TODO: some method of browser switch cases
    this.#styles = {
      Base: {
        '': {
          cursor: 'pointer',
        }
      },
      Toggle: {
        '': {
          'background-color': '#FAA',
          'border': 'solid 1px #F66',
          'border-radius':'1em',
          'width':'4em',
          'height':'2em',
          'display':'inline-block',
          'position':'relative',
          'transition':'.4s',
          'box-shadow':'#666 .2em .1em .3em'
        },
        ':before': {
          'content':'""',
          'height':'80%',
          'width':'40%',
          'border-radius':'100%',
          'background-color':'red',
          'position':'absolute',
          'top':'10%',
          'left':'5%',
          'transition':'.4s',
        },
        '.toggled': {
          'background-color':'lightgreen',
          'border-color':'darkgreen',
        },
        '.toggled:before': {
          'background-color':'green',
          'transform':'translateX(120%)'
        }
      },
      RadioGroup: {
        '':{
          'border-radius':'.5em',
          'padding':'1em',
          'background': 'transparent',
        },
        '.selected': {
          'background':'rgba(30,250,30,.5)',
          'border-style':'inset',
        },
      },
      Accordian: {
        ' .child':{
          'cursor':'default',
          'transition': 'height ease 1s',
          'overflow':'hidden',
        },
        ' .child.collapsed':{
          'height':'0px',
          'transition':'1s',
        },
      },
      Dropdown: {
        '':{
            'display': 'inline-block',
            'border': 'solid 1px black',
            'border-radius': '.5em',
            'text-indent': '1em',
        },
        ' .child':{
            'cursor': 'pointer',
            'list-style':'none',
            'margin': '0px',
            'padding': '0px',
            'text-indent': '0px',
            'box-shadow': 'black .25em .25em 1em',
            'transition': '1s',
        },
        ' .child.collapsed':{
            'transition':'.2s',
        },
        ' .child li':{
            'border-top': 'solid 1px black',
            'padding': '.5em 1em',
        },
        ' .child li:first-child':{
            'border-top': 'none',
        },
        ' .child li:focus':{
            'border': 'solid 1px yellow',
        },
      },
    }
    this.#cssInitialized = {}
  }

  // TODO: public method to override CSS

  #initCss(module) {
    if (this.#cssInitialized[module]) {
      return
    }
    if (module !== 'Base') {
      this.#initCss('Base')
    }
    
    // TODO: modules with their own classes which perform this logic
    let moduleComponent = ''
    switch (module) {
      case 'Toggle':
        moduleComponent = '.toggle'
        break;
      case 'RadioGroup':
        moduleComponent = '.radioBtn'
        break;
      case 'Accordian':
        moduleComponent = '.accordian'
        break;
      case 'Dropdown':
        moduleComponent = '.dropdown'
        break;
    }
    const css = new CSSStyleSheet()
    this.#styles[module]
    Object.entries(this.#styles[module]).forEach(([key,rules]) => {
      let prefix = `.${this.#baseClass}${moduleComponent}${key}`
      try {
        css.insertRule(`${prefix} {${Object.entries(rules).map(([k,v]) => `${k}:${v};`).join(';')}}`)
      } catch(e) {
        console.error("invalid rule:", `${prefix} {${Object.entries(rules).map(([k,v]) => `${k}:${v};`).join(';')}}`)
      }
    })
    document.adoptedStyleSheets.push(css)
    this.#cssInitialized[module] = true
  }

  Toggle(target) {
      // initializeCss(once)
      this.#initCss('Toggle')
      const toggleValue = target.value
      let component = document.createElement("span")
      component.classList.add(this.#baseClass,"toggle")
      if (target.checked) {
          component.classList.add("toggled")
          target.value = toggleValue;
      } else {
          target.value = ""
      }
      target.type = "hidden"
      target.after(component)
      component.addEventListener("click", evt => {
          // toggle the value
          component.classList.toggle("toggled")
          target.value = component.classList.contains("toggled") ? toggleValue : ""
      })
  }
  RadioGroup(targetName) {
    this.#initCss('RadioGroup')
    const radioInputs = document.querySelectorAll('[name="'+targetName+'"]')
    const newInput = document.createElement('input')
    const radioGroup = []
    newInput.type = 'hidden'
    newInput.name = radioInputs[0].name
    radioInputs[0].after(newInput)
    radioInputs.forEach(el => {
        const value = el.value
        const label = document.querySelector('[for='+el.id+']')
        let btnText = value
        if (label) {
            btnText = label.innerHTML
            label.remove()
        } 
        
        const btn = document.createElement('button')
        btn.classList.add(this.#baseClass,"radioBtn")
        btn.innerHTML = btnText;
        if (el.selected) {
            btn.classList.add("selected");
            newInput.value = value
        }
        btn.addEventListener('click', () => {
            btn.classList.add("selected")
            radioGroup.forEach(el2 => {
                if (btn !== el2) {
                    el2.classList.remove('selected')
                }
            })
            newInput.value = value;
            
        })
        el.after(btn)
        el.remove()
        radioGroup.push(btn)
    })
  }
  Accordian(outer, inner) {
    this.#initCss('Accordian')
    inner.addEventListener('toggle-accordian', () => {
      // recalc height (in case updated since last calc)
      inner.classList.toggle('collapsed')
      if (!inner.classList.contains('collapsed')) {
        let mHeight = window.getComputedStyle(inner).maxHeight
        if (mHeight && parseInt(mHeight) < inner.scrollHeight) {
          inner.style.height = mHeight
        } else {
          inner.style.height = inner.scrollHeight
        }
      } else {
        inner.style.height = 0;
      }
    })
    // need to get height of inner (inner.scrollHeight)..
    if (['none',''].indexOf(window.getComputedStyle(inner).display) !== -1) {
      inner.classList.add('collapsed')
      inner.style.height = 0;
    } else {
      let mHeight = window.getComputedStyle(inner).maxHeight
      if (mHeight && parseInt(mHeight) < inner.scrollHeight) {
        inner.style.height = mHeight
      } else {
        inner.style.height = inner.scrollHeight
      }
    }
    inner.classList.add('child')
    outer.classList.add(this.#baseClass,"accordian")
    outer.addEventListener('click', (evt) => {
      // ignore if click on inner
      if (inner.contains(evt.target)) {
        evt.preventDefault()
        return
      }
      // toggle show/hide of inner
      inner.dispatchEvent(new Event('toggle-accordian'))
    })
  }
  Dropdown(target) {
    this.#initCss('Dropdown')
    // create a hidden input, initial value = target.value
    const newInput = document.createElement('input')
    newInput.type = 'hidden'
    newInput.name = target.name
    newInput.value = target.value
    target.after(newInput)
    // create a div, after target
    const outer = document.createElement('div')
    outer.classList.add(this.#baseClass,'dropdown')
    outer.innerHTML = target.querySelector(':checked').innerHTML
    const inner = document.createElement('ul')
    target.querySelectorAll('option').forEach(opt => {
      const item = document.createElement('li')
      const val = opt.value
      
      item.innerHTML = opt.innerHTML
      item.tabIndex = 0
      const onClick = () => {
         // collapse accordian, set value
        newInput.value = val
        outer.childNodes[0].replaceWith(item.innerHTML)
        // still need to collapse the accordian
        inner.dispatchEvent(new Event('toggle-accordian'))
      }
      item.addEventListener('click', onClick)
      item.addEventListener('keypress', (evt) => {
        // TODO: Escape, Up/Down arrow, Typing to go to entry which starts with that letter?
        switch (evt.key) {
          case 'Enter':
            onClick();
            break
          default:
            // NOOP
        }
        if (evt.key == 'Enter') {
          onClick()
        }
        // TODO: On unfocus, if focus is outside the component, collapse the dropdown
      })
      
      inner.append(item)
    })
    outer.append(inner)
    this.Accordian(outer,inner)
    newInput.after(outer)
    target.remove()
  }
}
