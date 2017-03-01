# Crystal Slider

Readme languages: [English](README.md), [Русский](README.ru-Ru.md)

## Features

- lightweight JavaScript slider with minimally required functionality;
- without dependencies;
- responsive;
- support touch devices;

## Installation

### Step 1

Add basic html markup into your document:

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

### Step 2

Slider css is divided into styles needed for the plugin, and basic theme. Just include crystalslider.css:

```html
<link rel="stylesheet" href="css/crystalslider.css">
```

### Step 3

The last step — include crystalslider.min.js and call plugin:

```html
<script src="js/crystalslider.min.js"></script>
<script>
  const crystalSlider = new CrystalSlider();
</script>
```

## Options

The slider plugin has the following options:

| Name | Description | Type | Default |
| ------ | ------ | ------ | ------ |
| selector | slider selector | String | .crystal-slider |
| activeSlide | set index of the active slide | Number | 1 |
| loop | enable/disable slider loop | Boolean | true |
| fade | enable/disable fade mode | Boolean | false |
| duration | animation duration (in milliseconds) | Number | 500 |
| draggable | enable/disable drag | Boolean | true |
| adaptiveHeight | enable/disable adaptive height for slider | Boolean | false |
| threshold | touch dragging threshold (in pixels) | Number | 30 |
| title | enable/disable slides titles | Boolean | false |
| keyboard | enable/disable keyboard arrows | Boolean | false |
| easing | animation function | String | ease-out |
| nav | enable/disable navigation | Boolean | true |
| navPrevVal | previous button value | String | Prev |
| navNextVal | next button value | String | Next |
| pagination | enable/disable pagination | Boolean | false |
| thumbnails | enable/disable thumbnails (urls taken from data-attributes of slides) | Boolean | true |
| zIndex | z-index of the active slide (using in fade mode) | Number | 98 |
| onReady | callback after slider init | Function | |
| beforeChange | callback before slide change | Function | |
| afterChange | callback after slide change | Function | |

## API

| Name | Description |
| ------ | ------ |
| prevSlide() | go to previous slide |
| nextSlide() | go to next slide |
| goToSlide(index) | go to slide with current index |
| isEnabledOption(option) | return true if option is active |
| destroy() | destroy slider |
| reinit(options) | reinit slider with new options |
| activeSlide | get index of the active slide |
| slidesCount | get number of slides |

## Extra

- Version: 1.0.0
- License: MIT
