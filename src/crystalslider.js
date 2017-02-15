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
        // Main settings
        selector    : `.${sliderCls}`,
        activeSlide : 1,
        loop        : true,
        duration    : 500,
        draggable   : true,
        threshold   : 30,
        keyboard    : false,
        easing      : 'ease-out',
        // Nav
        nav        : true,
        navPrevVal : 'Prev',
        navNextVal : 'Next',
        // Pagination
        pagination : true,
        // Callbacks
        onReady      : function () {},
        beforeChange : function () {},
        afterChange  : function () {},
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

      if (t.activeSlide <= 1 && opts.loop === false) return;
      if (isFunction(opts.beforeChange)) {
        opts.beforeChange.call(t, t.activeSlide, t.slidesCount);
      }

      (t.activeSlide <= 1 && opts.loop === true) ? t.activeSlide = t.slidesCount : t.activeSlide -= 1;
      t._setActiveSlide();
    }

    nextSlide() {
      const t    = this;
      const opts = t.options;

      if ((t.activeSlide >= t.slidesCount) && opts.loop === false) return;
      if (isFunction(opts.beforeChange)) {
        opts.beforeChange.call(t, t.activeSlide, t.slidesCount);
      }

      (t.activeSlide >= t.slidesCount && opts.loop === true) ? t.activeSlide = 1 : t.activeSlide += 1;
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
      const trackStyle = t._track.style;

      t._isMove = true;
      t._transformX = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));
      trackStyle[transform] = `translate3d(${t._transformX}px, 0, 0)`;
      trackStyle.webkitTransition = `-webkit-transform ${opts.duration}ms ${opts.easing}`;
      trackStyle.transition = `transform ${opts.duration}ms ${opts.easing}`;

      setTimeout(() => {
        trackStyle.webkitTransition = '';
        trackStyle.transition = '';
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

      if (opts.nav === true && opts.loop === false) {
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

      slides.forEach((elem) => elem.classList.remove(t._activeCls));
      slides[t.activeSlide - 1].classList.add(t._activeCls);

      if (opts.pagination) {
        pagination.querySelectorAll(`.${t._paginationBtnCls}`).forEach((elem) => elem.classList.remove(t._activeCls));
        pagination.querySelectorAll(`.${t._paginationBtnCls}`)[t.activeSlide - 1].classList.add(t._activeCls);
      }

      t._disableNavBtns();
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

    // Build methods
    _build() {
      const t        = this;
      const opts     = t.options;
      const slider   = t._slider;
      const slides   = t._slides;
      const container  = doc.createElement('div');
      const track    = doc.createElement('div');
      const fragment = doc.createDocumentFragment();
      t._transformX  = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));

      slider.id = t._id;
      slider.classList.add(t._id);

      track.classList.add(t._trackCls);
      if (opts.draggable) {
        track.classList.add(t._draggableCls);
      }
      track.style.width      = `${t._sliderWidth * t.slidesCount}px`;
      track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;

      container.classList.add(t._containerCls);
      container.appendChild(track);
      slider.appendChild(container);

      // Slide settings
      slides.forEach((elem, index) => {
        elem.classList.add(t._slideCls);
        elem.setAttribute('data-crystal-slide', index + 1);
        elem.style.width = `${100 / t.slidesCount}%`;
        fragment.appendChild(elem);
      });

      track.appendChild(fragment);
      slides[t.activeSlide - 1].classList.add(t._activeCls);

      t._container = container;
      t._track = track;

      if (opts.nav === true && t.slidesCount > 1) t._createNav();
      if (opts.pagination === true && t.slidesCount > 1) t._createPagination();

      slider.classList.add(t._sliderReadyCls);

      t._updateWidth();
      t._callSliderEvent(opts.onReady, t.activeSlide, t.slidesCount);
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
      t._container.appendChild(t._nav);
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

      addEventListener('resize', t._resizeHandler.bind(t));
      if (opts.keyboard) {
        addEventListener('keyup', t._keyUpHandler.bind(t));
      }

      slider.addEventListener('click', t._mouseClickHandler.bind(t));
      track.addEventListener(transitionEnd, t._transitionEndHandler.bind(this));

      if (opts.draggable) {
        touchEvents.forEach((event) => track.addEventListener(event.name, t[event.handler].bind(t)));
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

      t._dragCoords.end        = (t._touch) ? e.changedTouches[0].pageX : e.pageX;
      t._track.style.transform = `translate3d(${t._transformX + (t._dragCoords.end - t._dragCoords.start)}px, 0, 0)`;
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
      e.preventDefault();
      e.stopPropagation();

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

      clearTimeout(t._windowTimer);
      t._windowTimer = setTimeout(function() {

        t.windowWidth = window.innerWidth;
        t._sliderWidth = t._slider.getBoundingClientRect().width;
        t._transformX  = Math.ceil(-t._sliderWidth * (t.activeSlide - 1));

        track.style.width      = `${t._sliderWidth * t.slidesCount}px`;
        track.style[transform] = `translate3d(${t._transformX}px, 0, 0)`;
      }, 50);
    }

    _resizeHandler() {
      const t = this;

      t._updateWidth();
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
