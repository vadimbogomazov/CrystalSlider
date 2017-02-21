# Crystal Slider

### Readme languages: [English](README.md), [Русский](README.ru-Ru.md)

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

CSS slider is divided into styles needed for the plugin, and basic theme. Just include crystalslider.css:

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
| duration | animation duration | Number | 500 |
| draggable | enable/disable drag | Boolean | true |
| adaptiveHeight | enable/disable adaptive height for slider | Boolean | false |
| threshold | touch dragging threshold | Number | 30 |
| keyboard | enable/disable keyboard arrows | Boolean | false |
| easing | animation function | String | ease-out |
| nav | enable/disable navigation | Boolean | true |
| navPrevVal | previous button text | String | Prev |
| navNextVal | next button text | String | Next |
| pagination | enabled/disabled pagination | Boolean | true |
| onReady | callback after slider init | Function | |
| beforeChange | callback before slide change | Function | |
| afterChange | callback after slide change | Function | |

## API

| Name | Description |
| ------ | ------ |
| prevSlide() | go to previous slide |
| nextSlide() | go to next slide |
| goToSlide(index) | go to slide with current index |
| activeSlide | get index of the active slide |
| slidesCount | get number of slides |

## Extra

- Version: 1.0.0
- License: MIT
