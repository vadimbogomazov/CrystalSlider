/*
  Name    : Crystal Slider
  Version : 1.0.0
  Github  : https://github.com/vadimbogomazov/CrystalSlider
*/

(function () {
  const doc           = document;
  const transform     = transformProp();
  const transitionEnd = transitionEndEventName();
  const sliderCls     = 'crystal-slider';

  class CrystalSlider {
    constructor(opts) {
      CrystalSlider._count = (CrystalSlider._count || 0) + 1;

      const t = this;
      // Default options
      t.options = {
        // Main
        selector           : `.${sliderCls}`,
        activeSlide        : 1,
        autoplay           : false,
        playInterval       : 5000,
        pauseOnHover       : false,
        loop               : true,
        fade               : false,
        zIndex             : 98,
        duration           : 500,
        draggable          : true,
        adaptiveHeight     : false,
        threshold          : 30,
        titles             : false,
        keyboard           : false,
        easing             : 'ease-out',
        // Nav
        nav                : true,
        navPrevVal         : 'Prev',
        navNextVal         : 'Next',
        appendNavTo        : null,
        // Pagination
        pagination         : false,
        thumbnails         : false,
        appendPaginationTo : null,
        // Callbacks
        onReady        : function () {},
        beforeChange   : function () {},
        afterChange    : function () {},
      };

      if (isObject(opts)) {
        t.options = Object.assign(t.options, opts);
      }

      t._id = `${sliderCls + '-' + CrystalSlider._count}`;
      t._isTouchDevice = isTouchDevice();

      t._init();
      t._build();
      t._bindEvents();
    }

    // Private Methods
    _setPosition(changeSlide = true) {
      const t = this;
      const opts = t.options;
      const slides = t._slides;
      const containerStyle = t._container.style;
      const trackStyle = t._track.style;

      t._isMove = true;

      if (!t.isEnabledOption('fade')) {
        t._transformX = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));

        trackStyle[transform] = `translate3d(${t._transformX}px, 0, 0)`;
        trackStyle.webkitTransition = `-webkit-transform ${opts.duration}ms ${opts.easing}`;
        trackStyle.transition = `transform ${opts.duration}ms ${opts.easing}`;
      }

      if (t.isEnabledOption('adaptiveHeight')) {
        containerStyle.webkitTransition = `height ${opts.duration}ms ${opts.easing}`;
        containerStyle.transition = `height ${opts.duration}ms ${opts.easing}`;
      }

      setTimeout(() => {
        trackStyle.webkitTransition = '';
        trackStyle.transition = '';

        if (t.isEnabledOption('adaptiveHeight')) {
          containerStyle.webkitTransition = '';
          containerStyle.transition = '';
        }

        t._isMove = false;

        if (changeSlide) {
          t._callSliderEvent(opts.afterChange, t.activeSlide, t.slidesLength);
        }
      }, opts.duration);
    }

    _disableNavBtns() {
      const t           = this;
      const opts        = t.options;
      const slider      = t._slider;
      const slides      = t._slides;
      const nav         = t._nav;
      const activeSlide = t.activeSlide;

      if (t.isEnabledOption('nav') && !t.isEnabledOption('loop')) {
        nav.querySelectorAll(`.${t._navBtnCls}`).forEach((elem) => elem.classList.remove(t._disabledCls));

        if (activeSlide <= 1) {
          nav.querySelector(`.${t._navPrevBtnCls}`).classList.add(t._disabledCls);
        } else if (activeSlide >= slides.length) {
          nav.querySelector(`.${t._navNextBtnCls}`).classList.add(t._disabledCls);
        }
      }
    }

    _setActiveSlide() {
      const t          = this;
      const opts       = t.options;
      const slider     = t._slider;
      const slides     = t._slides;
      const pagination = t._pagination;

      slides.forEach((elem) => {
        if (t.isEnabledOption('fade')) {
          elem.style.opacity = 0;
          elem.style.zIndex = opts.zIndex - 1;
        }
        elem.classList.remove(t._activeCls);
      });

      if (t.isEnabledOption('fade')) {
        slides[t.activeSlide - 1].style.opacity = 1;
        slides[t.activeSlide - 1].style.zIndex = opts.zIndex;
      }

      slides[t.activeSlide - 1].classList.add(t._activeCls);

      if (t.isEnabledOption('pagination') && t.slidesLength > 1) {
        pagination.querySelectorAll(`.${t._paginationBtnCls}`).forEach((elem) => elem.classList.remove(t._activeCls));
        pagination.querySelectorAll(`.${t._paginationBtnCls}`)[t.activeSlide - 1].classList.add(t._activeCls);
      }

      if (t.slidesLength > 1) {
        t._disableNavBtns();
        if (t.isEnabledOption('adaptiveHeight')) {
          t._setHeight();
        }

        t._setPosition();
      } else {
        t._setPosition(false);
      }
    }

    _callSliderEvent(sliderEvent, values) {
      if (isFunction(sliderEvent)) {
        sliderEvent.apply(this, [...arguments].slice(1));
      }
    }

    _resetDrag() {
      const t = this;

      t._dragCoords.start = 0;
      t._dragCoords.end   = 0;
    }

    _setHeight() {
      const t = this;

      t._container.style.height = `${t._slides[t.activeSlide - 1].clientHeight}px`;
    }

    _playSlider() {
      const t = this;
      const opts = t.options;

      if (t._isTouched || t._paused) {
        return;
      }

      t.nextSlide();
    }

    _init() {
      const t = this;

      t._slider = (typeof t.options.selector === 'string') ? doc.querySelector(t.options.selector) : t.options.selector;
      if (t._slider === null) {
        throw new Error(`Selector ${t.options.selector} does not exist`);
      }

      // Private properties
      t._sliderWidth   = t._slider.getBoundingClientRect().width;
      t._slides        = Array.from(t._slider.children);

      t._isMove        = false;
      t._isTouched     = false;

      t._container     = null;
      t._track         = null;
      t._nav           = null;
      t._pagination    = null;
      t._transformX    = null;
      t._touch         = null;
      t._resizeTimer   = null;
      t._playTimer     = null;

      if (t.options.draggable === true) {
        t._dragCoords = {
          start: 0,
          end: 0,
        };
      }

      // Classes
      t._sliderReadyCls     = `${sliderCls}_ready`;
      t._containerCls       = `${sliderCls}__slides-container`
      t._trackCls           = `${sliderCls}__track`;
      t._slideCls           = `${sliderCls}__slide`;
      t._titleCls           = `${sliderCls}__title`;

      t._navCls             = `${sliderCls}-nav`;
      t._navBtnCls          = `${t._navCls}__btn`;
      t._navPrevBtnCls      = `${t._navBtnCls}_prev`;
      t._navNextBtnCls      = `${t._navBtnCls}_next`;

      t._paginationCls      = `${sliderCls}-pagination`;
      t._paginationInnerCls = `${t._paginationCls}__inner`;
      t._paginationItemCls  = `${t._paginationCls}__item`
      t._paginationBtnCls   = `${t._paginationCls}__btn`;

      t._activeCls          = 'is-active';
      t._draggableCls       = 'is-draggable';
      t._touchCls           = 'is-touch';
      t._disabledCls        = 'is-disabled';

      // Public read-only properties
      t.slidesLength = t._slides.length;
      t.activeSlide  = t.options.activeSlide;

      if (t.activeSlide < 1 || t.activeSlide > t.slidesLength) {
        throw new Error(`Slide index ${t.activeSlide} does not exist`);
      }
    }

    _build() {
      const t           = this;
      const opts        = t.options;
      const slider      = t._slider;
      const slides      = t._slides;
      const activeSlide = slides[t.activeSlide - 1];
      const container   = doc.createElement('div');
      const track       = doc.createElement('div');
      const fragment    = doc.createDocumentFragment();

      if (!t.isEnabledOption('fade')) {
        t._transformX = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));
      }

      slider.setAttribute('data-crystal-id', t._id);
      slider.classList.add(t._id);
      if (t.isEnabledOption('draggable')) {
        slider.classList.add(t._draggableCls);
      }

      track.classList.add(t._trackCls);
      track.style.width = `${t._sliderWidth * t.slidesLength}px`;
      track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;

      container.classList.add(t._containerCls);
      container.appendChild(track);

      slider.appendChild(container);

      // Slide settings
      slides.forEach((elem, index) => {
        const elemStyle = elem.style;

        elem.classList.add(t._slideCls);
        elem.setAttribute('data-crystal-slide', index + 1);
        elemStyle.width = `${100 / t.slidesLength}%`;

        if (t.isEnabledOption('fade')) {
          elemStyle.transition = `opacity ${opts.duration}ms ${opts.easing}`;
          elemStyle.left = -(parseFloat(elemStyle.width) * index) + '%';
        }

        if (t.isEnabledOption('fade') && index !== t.activeSlide - 1) {
          elemStyle.opacity = 0;
          elemStyle.zIndex = opts.zIndex - 1;
        }

        if (t.isEnabledOption('titles')) {
          const title = doc.createElement('div');

          title.classList.add(t._titleCls);
          title.innerHTML = elem.getAttribute('data-crystal-title');

          elem.appendChild(title);
        }

        fragment.appendChild(elem);
      });

      if (t.isEnabledOption('titles')) {
        t._titles = slider.querySelectorAll(`${t._titleCls}`);
      }

      track.appendChild(fragment);
      activeSlide.style.opacity = 1;
      activeSlide.style.zIndex = opts.zIndex;
      activeSlide.classList.add(t._activeCls);

      t._container = container;
      t._track = track;

      if (t.isEnabledOption('nav')) {
        t._createNav();
      }
      if (t.isEnabledOption('pagination')) {
        t._createPagination();
      }

      slider.classList.add(t._sliderReadyCls);

      if (t.isEnabledOption('autoplay')) {
        t.play();
      }

      t._callSliderEvent(opts.onReady, t.activeSlide, t.slidesLength);
    }

    _createNav() {
      const t    = this;
      const opts = t.options;
      const nav  = doc.createElement('div');

      nav.classList.add(t._navCls);
      nav.innerHTML = `
        <button role="button" class="${t._navBtnCls + ' ' + t._navPrevBtnCls}" data-crystal-button="prev">${opts.navPrevVal}</button>\n
        <button role="button" class="${t._navBtnCls + ' ' + t._navNextBtnCls}" data-crystal-button="next">${opts.navNextVal}</button>
      `;

      t._nav = nav;

      if (!opts.appendNavTo) {
        t._slider.insertBefore(t._nav, t._container);
      } else {
        let navContainer = document.querySelector(opts.appendNavTo);

        if (navContainer === null) {
          return;
        }
        navContainer.appendChild(t._nav);
      }
    }

    _createPagination() {
      const t        = this;
      const opts     = t.options;
      const ul       = doc.createElement('ul');
      const fragment = doc.createDocumentFragment();

      t._pagination = doc.createElement('div');
      t._pagination.classList.add(t._paginationCls);

      ul.classList.add(t._paginationInnerCls);

      // Set and append pagination buttons
      t._slides.forEach((elem, index) => {
        const li  = doc.createElement('li');
        let btn;

        if (!t.isEnabledOption('thumbnails')) {
          btn = doc.createElement('button');
          btn.textContent = index + 1;
        } else {
          btn = doc.createElement('img');
          btn.src = elem.getAttribute('data-crystal-thumbnail');
        }

        btn.setAttribute('role', 'button');
        btn.setAttribute('data-crystal-button', index + 1);
        btn.classList.add(t._paginationBtnCls);
        li.appendChild(btn);
        li.classList.add(t._paginationItemCls);
        fragment.appendChild(li);
      });

      ul.appendChild(fragment);
      t._pagination.appendChild(ul);

      t._slider.appendChild(t._pagination);
      t._pagination.querySelectorAll(`.${t._paginationBtnCls}`)[t.activeSlide - 1].classList.add(t._activeCls);
      t._disableNavBtns();
    }

    // Events
    _bindEvents() {
      const t = this;
      const track = t._track;

      // Events
      const eventHandlers = [
        '_mouseClickHandler',
        '_mouseEnterHandler',
        '_mouseLeaveHandler',
        '_touchStartHandler',
        '_touchMoveHandler',
        '_touchEndHandler',
        '_keyUpHandler',
        '_transitionEndHandler',
        '_setHeight',
        '_updateWidth',
        '_resizeHandler',
      ];

      eventHandlers.forEach((handler) => {
        t[handler] = t[handler].bind(t);
      });

      window.addEventListener('resize', t._resizeHandler);
      if (t.isEnabledOption('adaptiveHeight')) {
        window.addEventListener('load', t._setHeight);
      }
      if (t.isEnabledOption('keyboard')) {
        window.addEventListener('keyup', t._keyUpHandler);
      }

      document.addEventListener('DOMContentLoaded', t._updateWidth);

      if (t.isEnabledOption('nav')) {
        t._nav.addEventListener('click', t._mouseClickHandler);
      }

      if (t.isEnabledOption('pagination')) {
        t._slider.addEventListener('click', t._mouseClickHandler);
      }

      if (t.isEnabledOption('pauseOnHover')) {
        t._track.addEventListener('mouseenter', t._mouseEnterHandler);
        t._track.addEventListener('mouseleave', t._mouseLeaveHandler);
      }

      t._slider.addEventListener(transitionEnd, t._transitionEndHandler);

      // Touch events
      if (t.isEnabledOption('draggable')) {
        t._dragCoords = {
          start: 0,
          end: 0,
        };

        track.addEventListener((t._isTouchDevice) ? 'touchstart' : 'mousedown', t._touchStartHandler, false);
        track.addEventListener((t._isTouchDevice) ? 'touchmove'  : 'mousemove', t._touchMoveHandler, false);
        track.addEventListener((t._isTouchDevice) ? 'touchend'   : 'mouseup', t._touchEndHandler, false);
        track.addEventListener('mouseleave', t._touchEndHandler);
      }
    }

    _unbindEvents() {
      const t = this;
      const slider = t._slider;
      const track = t._track;

      // Remove listeners
      if (t.isEnabledOption('keyboard')) {
        window.removeEventListener('keyup', t._keyUpHandler);
      }
      window.removeEventListener('resize', t._resizeHandler);

      if (t.isEnabledOption('nav')) {
        t._nav.removeEventListener('click', t._mouseClickHandler);
      }

      if (t.isEnabledOption('pagination')) {
        slider.removeEventListener('click', t._mouseClickHandler);
      }

      if (t.isEnabledOption('pauseOnHover')) {
        track.removeEventListener('mouseenter', t._mouseEnterHandler);
        track.removeEventListener('mouseleave', t._mouseLeaveHandler);
      }

      if (t.isEnabledOption('draggable')) {
        track.removeEventListener((t._isTouchDevice) ? 'touchstart' : 'mousedown', t._touchStartHandler);
        track.removeEventListener((t._isTouchDevice) ? 'touchmove'  : 'mousemove', t._touchMoveHandler);
        track.removeEventListener((t._isTouchDevice) ? 'touchend'   : 'mouseup', t._touchEndHandler);
        track.removeEventListener('mouseleave', t._touchEndHandler);
      }
    }

    // Events handlers
    _mouseClickHandler(e) {
      const t       = this;
      const opts    = t.options;
      const target  = e.target;
      const clsList = target.classList;
      const index   = Number(target.getAttribute('data-crystal-button'));

      if (t._isTouched || t._isMove) {
        return;
      }
      if (clsList.contains(t._navBtnCls)) {
        (target.getAttribute('data-crystal-button') === 'prev') ? t.prevSlide() : t.nextSlide();
      }
      if (clsList.contains(t._paginationBtnCls) && index !== t.activeSlide) {
        t.goToSlide(index);
      }
    }

    _mouseEnterHandler(e) {
      const t    = this;
      const opts = t.options;

      if (t.isEnabledOption('pauseOnHover')) {
        t._paused = true;
      }
    }

    _mouseLeaveHandler(e) {
      const t = this;

      if (t.isEnabledOption('pauseOnHover')) {
        t._paused = false;
      }
    }

    _touchStartHandler(e) {
      const t = this;

      if (!t._isTouchDevice) {
        e.preventDefault();
      }
      e.stopPropagation();

      if (t._isMove || (e.type === 'mousedown' && e.button > 0)) return;
      if (t._isTouchDevice && e.touches.length === 1) {
        t._touch = e.changedTouches[0];
      }

      t._isTouched = true;
      t._dragCoords.end = t._dragCoords.start = (t._touch) ? t._touch.pageX : e.pageX;
      t._slider.classList.add(t._touchCls);
    }

    _touchMoveHandler(e) {
      const t = this;

      if (!t._isTouchDevice) {
        e.preventDefault();
      }
      e.stopPropagation();

      if (!t._isTouched || t._isMove) {
        return;
      }

      if (t._isTouchDevice) {
        if (e.changedTouches[0].identifier !== t._touch.identifier) {
          return;
        }
      }

      t._dragCoords.end = (t._touch) ? e.changedTouches[0].pageX : e.pageX;

      if (!t.isEnabledOption('fade')) {
        t._track.style.transform = `translate3d(${t._transformX + (t._dragCoords.end - t._dragCoords.start)}px, 0, 0)`;
      }
    }

    _touchEndHandler(e) {
      e.stopPropagation();

      const t            = this;
      const opts         = t.options;
      const dragStart    = t._dragCoords.start;
      const dragEnd      = t._dragCoords.end;
      const coordsResult = dragStart - dragEnd;
      const activeSlide  = t.activeSlide;

      if (t._isMove) {
        return;
      }

      if (t._isTouchDevice) {
        if (e.changedTouches[0].identifier !== t._touch.identifier) {
          return;
        }
      }

      t._isTouched = false;
      t._slider.classList.remove(t._touchCls);
      t._resetDrag();

      // if (e.type === 'mouseup' && t.isEnabledOption('autoplay') && !t.isEnabledOption('pauseOnHover')) {
      //   t.play();
      // }

      if (!coordsResult) {
        return;
      }

      if (Math.abs(coordsResult) <= opts.threshold) {
        t._setPosition(false);

        return;
      }

      if (!opts.loop) {
        if ((activeSlide <= 1 && coordsResult < 0) ||
            (activeSlide >= t.slidesLength && (coordsResult > 0))
          ) {
          t._setPosition(false);

          return;
        }
      }

      (dragStart > dragEnd) ? t.nextSlide() : t.prevSlide();
    }

    _transitionEndHandler() {
      const t = this;

      t._slider.classList.remove(t._touchCls);
    }

    _keyUpHandler(e) {
      e.preventDefault();
      e.stopPropagation();

      const t    = this;
      const KEYS = {
        left: 37,
        right: 39
      }

      if (t._isMove || !t.isEnabledOption('keyboard')) {
        return;
      }

      switch (e.keyCode) {
        case KEYS.left:
          t.prevSlide();
        break;
        case KEYS.right:
          t.nextSlide();
        break;
      }
    }

    _updateWidth() {
      const t     = this;
      const track = t._track;

      if (t._resizeTimer) {
        clearTimeout(t._resizeTimer);
      }

      t._resizeTimer = setTimeout(function() {
        t.windowWidth = window.innerWidth;
        t._sliderWidth = t._slider.getBoundingClientRect().width;

        if (!t.isEnabledOption('fade')) {
          t._transformX = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));
        }

        track.style.width = `${t._sliderWidth * t.slidesLength}px`;
        track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;

        if (t.isEnabledOption('adaptiveHeight')) {
          t._setHeight();
        }
      }, 50);
    }

    _resizeHandler() {
      this._updateWidth();
    }

    // Public methods
    prevSlide() {
      const t    = this;
      const opts = t.options;

      if (t.activeSlide <= 1 && !t.isEnabledOption('loop')) {
        return;
      }
      if (isFunction(opts.beforeChange)) {
        opts.beforeChange.call(t, t.activeSlide, t.slidesLength);
      }

      (t.activeSlide <= 1 && t.isEnabledOption('loop')) ? t.activeSlide = t.slidesLength : t.activeSlide -= 1;
      t._setActiveSlide();
    }

    nextSlide() {
      const t    = this;
      const opts = t.options;

      if ((t.activeSlide >= t.slidesLength) && !t.isEnabledOption('loop')) {
        t._paused = true;
        // if (t.isEnabledOption('autoplay')) {
        //   t.stop();
        // }

        return;
      }

      if (isFunction(opts.beforeChange)) {
        opts.beforeChange.call(t, t.activeSlide, t.slidesLength);
      }

      (t.activeSlide >= t.slidesLength && t.isEnabledOption('loop')) ? t.activeSlide = 1 : t.activeSlide += 1;
      t._setActiveSlide();
    }

    goToSlide(index) {
      const t    = this;
      const opts = this.options;

      if (!Number.isInteger(index) || (index < 1 && index > t.slidesLength)) {
        return;
      }
      t._callSliderEvent(opts.beforeChange, t.activeSlide, t.slidesLength);

      t.activeSlide = index;
      t._setActiveSlide();
    }

    play() {
      const t = this;
      const opts = t.options;

      if (t._playTimer) {
        clearInterval(t._playTimer);
      }

      t._playTimer = setInterval(() => t._playSlider(), opts.playInterval);
    }

    stop() {
      const t = this;

      if (t._playTimer) {
        clearInterval(t._playTimer);
      }

    }

    isEnabledOption(option) {
      return (this.options[option] === true) || false;
    }

    destroy() {
      const t = this;
      const slider = t._slider;
      const track = t._track;

      // Remove attributes
      slider.removeAttribute('id')
      slider.classList.remove(t._sliderReadyCls, t._id, t._draggableCls);

      // Remove controls
      if (t.isEnabledOption('nav')) {
        removeElem(t._nav);
      }

      if (t.isEnabledOption('pagination')) {
        removeElem(t._pagination);
      }

      if (t.isEnabledOption('titles')) {
        slider.querySelectorAll(`.${t._titleCls}`).forEach(title => removeElem(title));
      }

      t._slides.forEach(elem => {
        elem.classList.remove(t._slideCls, t._activeCls);
        elem.removeAttribute('style');
        elem.removeAttribute('data-crystal-slide');
      });

      // Remove wrappers
      unwrap(t._track);
      unwrap(t._container);

      // Clear timers
      if (t._resizeTimer) {
        clearTimeout(t._resizeTimer);
      }

      if (t._playTimer) {
        clearTimeout(t._playTimer);
      }
    }

    reinit(opts) {
      const t = this;

      t.destroy();

      if (isObject(opts)) {
        t.options = Object.assign(t.options, opts);
      }

      t._init();
      t._build();
      t._bindEvents();

      if (t.isEnabledOption('adaptiveHeight')) {
        t._setHeight();
      }
    }
  }

  window.CrystalSlider = CrystalSlider;

  /* Helpers */
  function isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }

  function isTouchDevice() {
    return !!('ontouchstart' in window || navigator.maxTouchPoints);
  }

  function transformProp() {
    const elem = doc.createElement('div');

    if (elem.style.transform === null) {
      if (elem.style['WebkitTransform'] !== undefined) {
        return 'WebkitTransform';
      }
    }

    return 'transform';
  }

  function transitionEndEventName() {
    const elem = doc.createElement('div');
    const transitions = {
      'transition'      : 'transitionend',
      'WebkitTransition': 'webkitTransitionEnd'
    };

    for (let i in transitions) {
      if (transitions.hasOwnProperty(i) && elem.style[i] !== undefined) {
        return transitions[i];
      }
    }
  }

  function unwrap(wrapper) {
    const docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
      const child = wrapper.removeChild(wrapper.firstChild);
      docFrag.appendChild(child);
    }

    wrapper.parentNode.replaceChild(docFrag, wrapper);
  }

  function removeElem(element) {
    element.parentNode.removeChild(element);
  }

  function isObject(val) {
    if (val === null) {
      return;
    }
    return ((typeof val === 'function') || (typeof val === 'object'));
  }

})();
