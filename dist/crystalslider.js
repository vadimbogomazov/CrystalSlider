/*
  Name    : Crystal Slider
  Version : 1.0.0
  Github  : https://github.com/VadimBogomazov/CrystalSlider
  Author  : Vadim Bogomazov
*/

(function (window) {
  'use strict';

  const doc           = document;
  const transform     = transformProp();
  const transitionEnd = transitionEndEventName();

  class CrystalSlider {
    constructor(props) {
      CrystalSlider._count = (CrystalSlider._count || 0) + 1;

      const sliderCls = 'crystal-slider';

      // Default options
      const options = {
        // Main
        selector       : `.${sliderCls}`,
        activeSlide    : 1,
        fade           : false,
        loop           : true,
        duration       : 500,
        draggable      : true,
        adaptiveHeight : false,
        threshold      : 30,
        titles         : false,
        keyboard       : false,
        easing         : 'ease-out',
        // Nav
        nav            : true,
        navPrevVal     : 'Prev',
        navNextVal     : 'Next',
        // Pagination
        pagination     : true,
        zIndex         : 98,
        // Callbacks
        onReady        : function () {},
        beforeChange   : function () {},
        afterChange    : function () {},
      }

      const t   = this;
      t.options = Object.assign(options, props);

      t._id     = `${sliderCls + '-' + CrystalSlider._count}`;
      t._slider = doc.querySelector(t.options.selector);

      if (t._slider === null) {
        throw new Error(`Selector ${t.options.selector} does not exist`);
      }

      // Private properties
      t._sliderWidth   = t._slider.getBoundingClientRect().width;
      t._slides        = Array.from(t._slider.children);
      t._isTouchDevice = isTouchDevice();

      t._isMove        = false;
      t._isTouched     = false;

      t._container     = null;
      t._track         = null;
      t._nav           = null;
      t._pagination    = null;
      t._transformX    = null;
      t._touch         = null;
      t._windowTimer   = null;

      if (t.isEnabled('draggable')) {
        t._dragCoords = {
          start: 0,
          end: 0,
        };
      }

      // Classes
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

      t._sliderReadyCls     = 'is-ready';
      t._activeCls          = 'is-active';
      t._draggableCls       = 'is-draggable';
      t._touchCls           = 'is-touch';
      t._disabledCls        = 'is-disabled';

      // Public read-only properties
      t.slidesCount = t._slides.length;
      t.activeSlide = t.options.activeSlide;

      if (t.activeSlide < 1 || t.activeSlide > t.slidesCount) {
        throw new Error(`Slide index ${t.activeSlide} does not exist`);
      }

      t._init();
    }

    // Public methods
    prevSlide() {
      const t    = this;
      const opts = t.options;

      if (t.activeSlide <= 1 && !t.isEnabled('loop')) return;
      if (isFunction(opts.beforeChange)) {
        opts.beforeChange.call(t, t.activeSlide, t.slidesCount);
      }

      (t.activeSlide <= 1 && t.isEnabled('loop')) ? t.activeSlide = t.slidesCount : t.activeSlide -= 1;
      t._setActiveSlide();
    }

    nextSlide() {
      const t    = this;
      const opts = t.options;

      if ((t.activeSlide >= t.slidesCount) && !t.isEnabled('loop')) return;
      if (isFunction(opts.beforeChange)) {
        opts.beforeChange.call(t, t.activeSlide, t.slidesCount);
      }

      (t.activeSlide >= t.slidesCount && t.isEnabled('loop')) ? t.activeSlide = 1 : t.activeSlide += 1;
      t._setActiveSlide();
    }

    goToSlide(index) {
      const t    = this;
      const opts = this.options;

      if (index < 1 && index > t.slidesCount) return;
      t._callSliderEvent(opts.beforeChange, t.activeSlide, t.slidesCount);

      t.activeSlide = index;
      t._setActiveSlide();
    }

    // Private Methods
    _setPosition(changeSlide = true) {
      const t = this;
      const opts = t.options;
      const slides = t._slides;
      const containerStyle = t._container.style;
      const trackStyle = t._track.style;

      t._isMove = true;

      if (!t.isEnabled('fade')) {
        t._transformX = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));

        trackStyle[transform] = `translate3d(${t._transformX}px, 0, 0)`;
        trackStyle.webkitTransition = `-webkit-transform ${opts.duration}ms ${opts.easing}`;
        trackStyle.transition = `transform ${opts.duration}ms ${opts.easing}`;
      }

      if (t.isEnabled('adaptiveHeight')) {
        containerStyle.webkitTransition = `height ${opts.duration}ms ${opts.easing}`;
        containerStyle.transition = `height ${opts.duration}ms ${opts.easing}`;
      }

      setTimeout(() => {
        trackStyle.webkitTransition = '';
        trackStyle.transition = '';

        if (t.isEnabled('adaptiveHeight')) {
          containerStyle.webkitTransition = '';
          containerStyle.transition = '';
        }

        t._isMove = false;

        if (changeSlide) {
          t._callSliderEvent(opts.afterChange, t.activeSlide, t.slidesCount);
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

      if (t.isEnabled('nav') && !t.isEnabled('loop')) {
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
        if (t.isEnabled('fade')) {
          elem.style.opacity = 0;
          elem.style.zIndex = opts.zIndex - 1;
        }
        elem.classList.remove(t._activeCls);
      });

      if (t.isEnabled('fade')) {
        slides[t.activeSlide - 1].style.opacity = 1;
        slides[t.activeSlide - 1].style.zIndex = opts.zIndex;
      }

      slides[t.activeSlide - 1].classList.add(t._activeCls);

      if (t.isEnabled('pagination')) {
        pagination.querySelectorAll(`.${t._paginationBtnCls}`).forEach((elem) => elem.classList.remove(t._activeCls));
        pagination.querySelectorAll(`.${t._paginationBtnCls}`)[t.activeSlide - 1].classList.add(t._activeCls);
      }

      t._disableNavBtns();
      t._setHeight();
      t._setPosition();
    }

    _callSliderEvent(sliderEvent, values) {
      if (isFunction(sliderEvent)) {
        sliderEvent.apply(this, [...arguments].shift());
      }
    }

    _resetDrag() {
      const t = this;

      t._dragCoords.start = 0;
      t._dragCoords.end   = 0;
    }

    _setHeight() {
      const t = this;
      const opts = t.options;
      const container = t._container;

      if (!t.isEnabled('adaptiveHeight')) return;

      container.style.height = `${t._slides[t.activeSlide - 1].clientHeight}px`;
    }

    isEnabled(option) {
      return (this.options[option] === true) || false;
    }

    // Build methods
    _build() {
      const t         = this;
      const opts      = t.options;
      const slider    = t._slider;
      const slides    = t._slides;
      const activeSlide = slides[t.activeSlide - 1];
      const container = doc.createElement('div');
      const track     = doc.createElement('div');
      const fragment  = doc.createDocumentFragment();

      t._transformX   = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));

      slider.id = t._id;
      slider.classList.add(t._id);

      track.classList.add(t._trackCls);
      if (t.isEnabled('draggable')) {
        track.classList.add(t._draggableCls);
      }
      track.style.width = `${t._sliderWidth * t.slidesCount}px`;
      track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;

      container.classList.add(t._containerCls);
      container.appendChild(track);

      slider.appendChild(container);

      // Slide settings
      slides.forEach((elem, index) => {
        const elemStyle = elem.style;

        elem.classList.add(t._slideCls);
        elem.setAttribute('data-crystal-slide', index + 1);
        elemStyle.width = `${100 / t.slidesCount}%`;

        if (t.isEnabled('fade')) {
          elemStyle.transition = `opacity ${opts.duration}ms ${opts.easing}`;
          elemStyle.position = 'relative';
          elemStyle.left = -(parseInt(elemStyle.width) * index) + '%';
        }

        if (t.isEnabled('fade') && index !== t.activeSlide - 1) {
          elemStyle.opacity = 0;
          elemStyle.zIndex = opts.zIndex - 1;
        }

        if (t.isEnabled('titles')) {
          const title = doc.createElement('div');
          title.classList.add(t._titleCls);
          title.innerHTML = elem.getAttribute('data-crystal-title');

          elem.appendChild(title);
        }

        fragment.appendChild(elem);
      });

      track.appendChild(fragment);
      activeSlide.style.opacity = 1;
      activeSlide.style.zIndex = opts.zIndex;
      activeSlide.classList.add(t._activeCls);

      t._container = container;
      t._track = track;

      t._createNav();
      t._createPagination();

      slider.classList.add(t._sliderReadyCls);
      t._callSliderEvent(opts.onReady, t.activeSlide, t.slidesCount);
    }

    _createNav() {
      const t    = this;
      const opts = t.options;
      const nav  = doc.createElement('div');

      if (!t.isEnabled('nav') && t.slidesCount < 1) return;

      nav.classList.add(t._navCls);
      nav.innerHTML = `
        <button role="button" class="${t._navBtnCls + ' ' + t._navPrevBtnCls}" data-crystal-button="prev">${opts.navPrevVal}</button>\n
        <button role="button" class="${t._navBtnCls + ' ' + t._navNextBtnCls}" data-crystal-button="next">${opts.navNextVal}</button>
      `;

      t._nav = nav
      t._slider.appendChild(t._nav);
    }

    _createPagination() {
      const t        = this;
      const opts     = t.options;
      const ul       = doc.createElement('ul');
      const fragment = doc.createDocumentFragment();

      if (!t.isEnabled('pagination') && t.slidesCount < 1) return;

      t._pagination = doc.createElement('div');
      t._pagination.classList.add(t._paginationCls);

      ul.classList.add(t._paginationInnerCls);

      // Set and append pagination buttons
      t._slides.forEach((elem, index) => {
        const li  = doc.createElement('li');
        const btn = doc.createElement('button');

        btn.setAttribute('role', 'button');
        btn.setAttribute('data-crystal-button', index + 1);
        btn.classList.add(t._paginationBtnCls);
        btn.textContent = index + 1;

        li.classList.add(t._paginationItemCls);
        li.appendChild(btn);
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
      const t            = this;
      const opts         = t.options;
      const slider       = t._slider;
      const track        = t._track;
      const touchEvents  = [
        { name: (t._isTouchDevice) ? 'touchstart' : 'mousedown', handler: '_touchStartHandler' },
        { name: (t._isTouchDevice) ? 'touchmove'  : 'mousemove', handler: '_touchMoveHandler' },
        { name: (t._isTouchDevice) ? 'touchend'   : 'mouseup',   handler: '_touchEndHandler' },
        { name: 'mouseleave', handler: '_mouseLeaveHandler' },
      ];

      addEventListener('load', () => t._setHeight());
      addEventListener('DOMContentLoaded', t._updateWidth.bind(t));
      addEventListener('resize', t._resizeHandler.bind(t));

      if (t.isEnabled('keyboard')) {
        addEventListener('keyup', t._keyUpHandler.bind(t));
      }

      slider.addEventListener('click', t._mouseClickHandler.bind(t));
      track.addEventListener(transitionEnd, t._transitionEndHandler.bind(this));

      if (t.isEnabled('draggable')) {
        touchEvents.forEach((event) => {
          track.addEventListener(event.name, t[event.handler].bind(t), (event.name === 'touchmove' || event.name === 'touchstart') ? { passive: true } : false);
        });
      }
    }

    // Events handlers
    _touchStartHandler(e) {
      e.preventDefault();
      e.stopPropagation();

      const t = this;

      if (t._isMove || (e.type === 'mousedown' && e.button > 0)) return;
      if (t._isTouchDevice && e.touches.length === 1) {
        t._touch = e.changedTouches[0];
      }

      t._isTouched = true;
      t._dragCoords.end = t._dragCoords.start = (t._touch) ? t._touch.pageX : e.pageX;
      t._track.classList.add(t._touchCls);
    }

    _touchMoveHandler(e) {
      e.preventDefault();
      e.stopPropagation();

      const t = this;

      if (!t._isTouched || t._isMove) return;

      if (t._isTouchDevice) {
        if (e.changedTouches[0].identifier !== t._touch.identifier) return;
      }

      t._dragCoords.end = (t._touch) ? e.changedTouches[0].pageX : e.pageX;

      if (!t.isEnabled('fade')) {
        t._track.style.transform = `translate3d(${t._transformX + (t._dragCoords.end - t._dragCoords.start)}px, 0, 0)`;
      }
    }

    _touchEndHandler(e) {
      e.preventDefault();
      e.stopPropagation();

      const t            = this;
      const opts         = t.options;
      const dragStart    = t._dragCoords.start;
      const dragEnd      = t._dragCoords.end;
      const coordsResult = dragStart - dragEnd;
      const activeSlide  = t.activeSlide;

      if (t._isMove) return;

      if (t._isTouchDevice) {
        if (e.changedTouches[0].identifier !== t._touch.identifier) return;
      }

      t._isTouched = false;
      t._track.classList.remove(t._touchCls);
      t._resetDrag();

      if (!coordsResult) return;

      if (Math.abs(coordsResult) <= opts.threshold) {
        t._setPosition(false);

        return;
      }

      if (!opts.loop) {
        if ((activeSlide <= 1 && coordsResult < 0) ||
            (activeSlide >= t.slidesCount && (coordsResult > 0))
          ) {
          t._setPosition(false);

          return;
        }
      }

      (dragStart > dragEnd) ? t.nextSlide() : t.prevSlide();
    }

    _mouseLeaveHandler(e) {
      const t = this;

      t._touchEndHandler(e);
    }

    _mouseClickHandler(e) {
      const t       = this;
      const opts    = t.options;
      const target  = e.target;
      const clsList = target.classList;
      const index   = +target.getAttribute('data-crystal-button');

      if (t._isTouched || t._isMove) return;
      if (clsList.contains(t._navBtnCls)) {
        (target.getAttribute('data-crystal-button') === 'prev') ? t.prevSlide() : t.nextSlide();
      }
      if (clsList.contains(t._paginationBtnCls) && index !== t.activeSlide) t.goToSlide(index);
    }

    _transitionEndHandler() {
      const t = this;
      t._track.classList.remove(t._touchCls);
    }

    _keyUpHandler(e) {
      e.preventDefault();
      e.stopPropagation();

      const t    = this;
      const KEYS = {
        left: 37,
        right: 39
      }

      if (t._isMove) return;

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

      if (t._windowTimer) clearTimeout(t._windowTimer);

      t._windowTimer = setTimeout(function() {
        t.windowWidth = window.innerWidth;
        t._sliderWidth = t._slider.getBoundingClientRect().width;

        if (!t.isEnabled('fade')) {
          t._transformX = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));
        }

        track.style.width = `${t._sliderWidth * t.slidesCount}px`;
        track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;

        t._setHeight();
      }, 50);
    }

    _resizeHandler() {
      this._updateWidth();
    }

    // Init slider
    _init() {
      const t = this;

      t._build();
      t._bindEvents();
    }
  }

  window['CrystalSlider'] = CrystalSlider;

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
        if (transitions.hasOwnProperty(i) && elem.style[i] !== undefined) return transitions[i];
    }
  }
})(window);
