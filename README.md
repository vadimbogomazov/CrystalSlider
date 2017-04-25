# Crystal Slider
![version 1.1.0](https://badge.fury.io/gh/vadimbogomazov%2FCrystalSlider.svg)


Readme languages: [English](README.md), [Русский](README.ru-Ru.md)

## Features

- lightweight slider with minimum required functionality written in vanilla JS;
- no dependencies;
- responsive;
- touch device support;
- user-friendly;

## Demo

[https://vadimbogomazov.github.io/CrystalSlider/](https://vadimbogomazov.github.io/CrystalSlider/)

### More examples

- [Multiple slider instances](examples/multiple.html)
- [Slider with thumbnails](examples/thumbnails.html)
- [Autoplay](examples/autoplay.html)
- [Append navigation/pagination to custom element](examples/appendto.html)

## Installation

### Create HTML markup

Create `<div class="crystal-slider">` and `<div>` inside for each slide:

```html
<div class="crystal-slider">
  <div>
    <img src="img/slide-1.jpg" alt="">
  </div>
  <div>
    <img src="img/slide-2.jpg" alt="">
  </div>
  <div>
    <img src="img/slide-3.jpg" alt="">
  </div>
</div>
```

### Include plugin files

Include `crystalslider.css` and `crystalslider.min.js`:

```html
<link rel="stylesheet" href="css/crystalslider.css">
<script src="js/crystalslider.min.js">
```

Slider css is divided into styles needed for correct plugin work, and styles of the basic theme (optional).

### Call plugin

And the last step — calling plugin by specifying the required selector in options:

```html
<script>
  const crystalSlider = new CrystalSlider({
    selector: 'your-selector' // .crystal-slider – default selector
  });
</script>
```

## Options

The slider plugin has the following options:

| Name | Description | Type | Default |
| ------ | ------ | ------ | ------ |
| selector | slider selector | String | .crystal-slider |
| activeSlide | active slide index | Number | 1 |
| loop | slider loop | Boolean | true |
| autoplay | slider autoplay | Boolean | false |
| playInterval | play interval | Number | 5000 |
| pauseOnHover | pause on hover | Boolean | false |
| fade | fade mode | Boolean | false |
| duration | animation duration (in ms) | Number | 500 |
| draggable | slide dragging | Boolean | true |
| adaptiveHeight | adaptive height | Boolean | false |
| threshold | touch dragging threshold (in px) | Number | 30 |
| titles | slides titles (values are taken from the data-attributes of slides) | Boolean | false |
| keyboard | keyboard arrows ← → | Boolean | false |
| easing | easing function ([http://easings.net/en](http://easings.net/en)) | String | ease-out |
| nav | navigation | Boolean | true |
| navPrevVal | previous button value | String | Prev |
| navNextVal | next button value | String | Next |
| appendNavTo | element where the navigation are attached | String or DOM element | null |
| pagination | pagination | Boolean | false |
| appendPaginationTo | element where the pagination are attached | String or DOM element | null |
| thumbnails | thumbnails (images are taken from the data-attributes of slides) | Boolean | true |
| zIndex | slide z-index (used in fade mode) | Number | 98 |
| onReady | callback after slider initiation | Function | |
| beforeChange | callback before slide change | Function | |
| afterChange | callback after slide change | Function | |

## API

| Name | Description |
| ------ | ------ |
| prevSlide() | slides to the previous slide |
| nextSlide() | slides to the next slide |
| goToSlide(index) | slides to a slide with the set index (index {Number}) |
| play() | start auto changing slides |
| stop() | stop auto changing slides |
| isEnabledOption(option) | returns true if the option is enable (option {String}) |
| destroy() | destroy the slider instance |
| reinit(options) | slider reinit with new options (options {Object}) |
| activeSlide | active slide index (read only) |
| slidesLength | number of slides (read only) |

## License

MIT