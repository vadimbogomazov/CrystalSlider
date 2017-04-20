/*
  Name    : Crystal Slider
  Version : 1.1.0
  Github  : https://github.com/vadimbogomazov/CrystalSlider
*/
'use strict';

const doc           = document;
const transform     = transformProp();
const transitionEnd = transitionEndEventName();
const sliderCls     = 'crystal-slider';

export default class CrystalSlider {
  constructor(opts) {
    CrystalSlider._count = (CrystalSlider._count || 0) + 1;

    const t = this;
    // Default options
    t.options = {
      // Main
      selector           : `.${sliderCls}`,
      activeSlide        : 1,
      loop               : true,
      autoplay           : false,
      playInterval       : 5000,
      pauseOnHover       : false,
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
      // Classes
      sliderReadyCls     : `${sliderCls}_ready`,
      containerCls       : `${sliderCls}__slides-container`,
      trackCls           : `${sliderCls}__track`,
      slideCls           : `${sliderCls}__slide`,
      titleCls           : `${sliderCls}__title`,

      navCls             : `${sliderCls}-nav`,
      navBtnCls          : `${sliderCls}-nav__btn`,
      navPrevBtnCls      : `${sliderCls}-nav__btn_prev`,
      navNextBtnCls      : `${sliderCls}-nav__btn_next`,

      paginationCls      : `${sliderCls}-pagination`,
      paginationInnerCls : `${sliderCls}-pagination__inner`,
      paginationItemCls  : `${sliderCls}-pagination__item`,
      paginationBtnCls   : `${sliderCls}-pagination__btn`,

      activeCls          : 'is-active',
      draggableCls       : 'is-draggable',
      touchCls           : 'is-touch',
      disabledCls        : 'is-disabled',
      // Callbacks
      onReady            : () => {},
      beforeChange       : () => {},
      afterChange        : () => {},
    };

    if (isObject(opts)) {
      t.options = mergeObjects(t.options, opts);
    }

    t._id = `${sliderCls + '-' + CrystalSlider._count}`;
    t._isTouchDevice = isTouchDevice();

    t._init();
    t._build();
    t._bindEvents();
  }

  // Private methods
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

      if (t._play) {
        t.play();
      }

      if (changeSlide && isFunction(opts.afterChange)) {
        t._callSliderEvent(opts.afterChange, t, t.activeSlide, t.slidesLength);
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
      nav.querySelectorAll(`.${opts.navBtnCls}`).forEach((elem) => elem.classList.remove(opts.disabledCls));

      if (activeSlide <= 1) {
        nav.querySelector(`.${opts.navPrevBtnCls}`).classList.add(opts.disabledCls);
      } else if (activeSlide >= slides.length) {
        nav.querySelector(`.${opts.navNextBtnCls}`).classList.add(opts.disabledCls);
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
      elem.classList.remove(opts.activeCls);
    });

    if (t.isEnabledOption('fade')) {
      slides[t.activeSlide - 1].style.opacity = 1;
      slides[t.activeSlide - 1].style.zIndex = opts.zIndex;
    }

    slides[t.activeSlide - 1].classList.add(opts.activeCls);

    if (t.isEnabledOption('pagination') && t.slidesLength > 1) {
      [].slice.call(pagination.querySelectorAll(`.${opts.paginationBtnCls}`)).forEach((elem) => elem.classList.remove(opts.activeCls));
      pagination.querySelectorAll(`.${opts.paginationBtnCls}`)[t.activeSlide - 1].classList.add(opts.activeCls);
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

    if (t._isTouched || t._isMove || t._paused) {
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
    t._sliderWidth = t._slider.getBoundingClientRect().width;
    t._slides      = [].slice.call(t._slider.children);

    t._isMove      = false;
    t._isTouched   = false;

    t._play        = false;
    t._paused      = false;

    t._container   = null;
    t._track       = null;
    t._nav         = null;
    t._pagination  = null;

    t._transformX  = null;
    t._touch       = null;

    t._resizeTimer = null;
    t._playTimer   = null;

    if (t.options.draggable === true) {
      t._dragCoords = {
        start: 0,
        end: 0,
      };
    }

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
      slider.classList.add(opts.draggableCls);
    }

    track.classList.add(opts.trackCls);
    track.style.width = `${t._sliderWidth * t.slidesLength}px`;
    track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;

    container.classList.add(opts.containerCls);
    container.appendChild(track);

    slider.appendChild(container);

    // Slide settings
    slides.forEach((elem, index) => {
      const elemStyle = elem.style;

      elem.classList.add(opts.slideCls);
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

        title.classList.add(opts.titleCls);
        title.innerHTML = elem.getAttribute('data-crystal-title');

        elem.appendChild(title);
      }

      fragment.appendChild(elem);
    });

    if (t.isEnabledOption('titles')) {
      t._titles = slider.querySelectorAll(`${opts.titleCls}`);
    }

    track.appendChild(fragment);
    activeSlide.style.opacity = 1;
    activeSlide.style.zIndex = opts.zIndex;
    activeSlide.classList.add(opts.activeCls);

    t._container = container;
    t._track = track;

    if (t.isEnabledOption('nav')) {
      t._createNav();
    }
    if (t.isEnabledOption('pagination')) {
      t._createPagination();
    }

    slider.classList.add(opts.sliderReadyCls);

    if (t.isEnabledOption('autoplay')) {
      t.play();
    }
    if (isFunction(opts.onReady)) {
      t._callSliderEvent(opts.onReady, t, t.activeSlide, t.slidesLength);
    }
  }

  _createNav() {
    const t       = this;
    const opts    = t.options;
    const nav     = doc.createElement('div');

    nav.classList.add(opts.navCls);
    nav.innerHTML = `
      <button role="button" class="${opts.navBtnCls + ' ' + opts.navPrevBtnCls}" data-crystal-button="prev">${opts.navPrevVal}</button>\n
      <button role="button" class="${opts.navBtnCls + ' ' + opts.navNextBtnCls}" data-crystal-button="next">${opts.navNextVal}</button>
    `;

    t._nav = nav;

    if (!opts.appendNavTo) {
      t._slider.insertBefore(t._nav, t._container);
    } else {
      let navContainer = (typeof opts.appendNavTo === 'string') ? doc.querySelector(opts.appendNavTo) : opts.appendNavTo;

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
    t._pagination.classList.add(opts.paginationCls);

    ul.classList.add(opts.paginationInnerCls);

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
      btn.classList.add(opts.paginationBtnCls);
      li.appendChild(btn);
      li.classList.add(opts.paginationItemCls);
      fragment.appendChild(li);
    });

    ul.appendChild(fragment);
    t._pagination.appendChild(ul);

    if (!opts.appendNavTo) {
      t._slider.appendChild(t._pagination);
    } else {
      let paginationContainer = (typeof opts.appendPaginationTo === 'string') ? doc.querySelector(opts.appendPaginationTo) : opts.appendPaginationTo;

      if (paginationContainer === null) {
        return;
      }

      paginationContainer.appendChild(t._pagination);
    }

    t._pagination.querySelectorAll(`.${opts.paginationBtnCls}`)[t.activeSlide - 1].classList.add(opts.activeCls);
    t._disableNavBtns();
  }

  // Events
  _bindEvents() {
    const t      = this;
    const slider = t._slider;
    const track  = t._track;
    const nav    = t._nav;

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

    doc.addEventListener('DOMContentLoaded', t._updateWidth);

    if (t.isEnabledOption('nav')) {
      t._nav.addEventListener('click', t._mouseClickHandler);
    }

    if (t.isEnabledOption('pagination')) {
      t._pagination.addEventListener('click', t._mouseClickHandler);
    }

    if (t.isEnabledOption('pauseOnHover')) {
      track.addEventListener('mouseenter', t._mouseEnterHandler);
      track.addEventListener('mouseleave', t._mouseLeaveHandler);

      nav.addEventListener('mouseenter', t._mouseEnterHandler);
      nav.addEventListener('mouseleave', t._mouseLeaveHandler);
    }

    slider.addEventListener(transitionEnd, t._transitionEndHandler);

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
      t._pagination.removeEventListener('click', t._mouseClickHandler);
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

    t._playClear();

    if (clsList.contains(opts.navBtnCls)) {
      (target.getAttribute('data-crystal-button') === 'prev') ? t.prevSlide() : t.nextSlide();
    }
    if (clsList.contains(opts.paginationBtnCls) && index !== t.activeSlide) {
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

    if (t._isMove || (e.type === 'mousedown' && e.button > 0)) {
      return;
    }
    if (t._isTouchDevice && e.touches.length === 1) {
      t._touch = e.changedTouches[0];
    }

    t._isTouched = true;
    t._dragCoords.end = t._dragCoords.start = (t._touch) ? t._touch.pageX : e.pageX;
    t._slider.classList.add(t.options.touchCls);
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
    t._slider.classList.remove(opts.touchCls);
    t._resetDrag();

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

    t._slider.classList.remove(t.options.touchCls);
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
    let nextSlide = t.activeSlide - 1;

    if (t.activeSlide <= 1 && !t.isEnabledOption('loop')) {
      return;
    }

    if (nextSlide < 1) {
      nextSlide = t.slidesLength;
    }

    if (isFunction(opts.beforeChange)) {
      opts.beforeChange.call(t, t, t.activeSlide, nextSlide, t.slidesLength);
    }

    (t.activeSlide <= 1 && t.isEnabledOption('loop')) ? t.activeSlide = t.slidesLength : t.activeSlide -= 1;
    t._setActiveSlide();
  }

  nextSlide() {
    const t    = this;
    const opts = t.options;
    let nextSlide = t.activeSlide + 1;

    if ((t.activeSlide >= t.slidesLength) && !t.isEnabledOption('loop')) {
      t._paused = true;

      return;
    }

    if (nextSlide > t.slidesLength) {
      nextSlide = 1;
    }

    if (isFunction(opts.beforeChange)) {
      opts.beforeChange.call(t, t, t.activeSlide, nextSlide, t.slidesLength);
    }

    (t.activeSlide >= t.slidesLength && t.isEnabledOption('loop')) ? t.activeSlide = 1 : t.activeSlide += 1;
    t._setActiveSlide();
  }

  goToSlide(index) {
    const t    = this;
    const opts = this.options;

    if (!isNumeric(index) || (index < 1 && index > t.slidesLength)) {
      return;
    }
    if (isFunction(opts.beforeChange)) {
      t._callSliderEvent(opts.beforeChange, t, t.activeSlide, index, t.slidesLength);
    }

    t.activeSlide = index;
    t._setActiveSlide();
  }

  play() {
    const t = this;
    const opts = t.options;

    t._playClear();
    t._play = true;
    t._playTimer = setInterval(() => t._playSlider(), opts.playInterval);
  }

  stop() {
    const t = this;

    t._play = false;
    t._paused = false;
    t._playClear();
  }

  _playClear() {
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
    slider.classList.remove(opts.sliderReadyCls, t._id, opts.draggableCls);

    t._slides.forEach(elem => {
      elem.classList.remove(opts.slideCls, opts.activeCls);
      elem.removeAttribute('style');
      elem.removeAttribute('data-crystal-slide');
    });

    // Remove elements
    if (t.isEnabledOption('nav')) {
      removeElem(t._nav);
    }

    if (t.isEnabledOption('pagination')) {
      removeElem(t._pagination);
    }

    if (t.isEnabledOption('titles')) {
      slider.querySelectorAll(`.${opts.titleCls}`).forEach(title => removeElem(title));
    }

    // Remove wrappers
    unwrap(t._track);
    unwrap(t._container);

    // Clear timers
    if (t._resizeTimer) {
      clearTimeout(t._resizeTimer);
    }

    t._playClear();
  }

  reinit(opts) {
    const t = this;

    t.destroy();

    if (isObject(opts)) {
      t.options = mergeObjects(t.options, opts);
    }

    t._init();
    t._build();
    t._bindEvents();

    if (t.isEnabledOption('adaptiveHeight')) {
      t._setHeight();
    }
  }
}

// Helpers
function mergeObjects() {
  const resObj = {};

  for (let i = 0; i < arguments.length; i += 1) {
    let obj = arguments[i],
        keys = Object.keys(obj);

    for (let j = 0; j < keys.length; j += 1) {
      resObj[keys[j]] = obj[keys[j]];
    }
  }
  return resObj;
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
  const docFrag = doc.createDocumentFragment();
  while (wrapper.firstChild) {
    const child = wrapper.removeChild(wrapper.firstChild);
    docFrag.appendChild(child);
  }

  wrapper.parentNode.replaceChild(docFrag, wrapper);
}

function removeElem(element) {
  element.parentNode.removeChild(element);
}

function isFunction(functionToCheck) {
  return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
}

function isTouchDevice() {
  return !!('ontouchstart' in window || navigator.maxTouchPoints);
}

function isObject(val) {
  if (val === null) {
    return;
  }
  return ((typeof val === 'function') || (typeof val === 'object'));
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}