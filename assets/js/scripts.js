window.addEventListener('DOMContentLoaded', function () {

  const crystalSlider = new CrystalSlider({
    adaptiveHeight: true,
    keyboard: true,
    captions: true,
    easing: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)',
    navPrevVal: '',
    navNextVal: '',
    pagination: true,
    beforeChange: function(activeSlide, totalSlides) {
      console.log('Before change slide, ', 'active slide: ' + activeSlide + ', ', 'total slides: ' + totalSlides);
    },
    afterChange: function(activeSlide, totalSlides) {
      console.log('After change slide, ', 'active slide: ' + activeSlide + ', ', 'total slides: ' + totalSlides);
    },
    onReady: function (activeSlide, totalSlides) {
      console.log('Crystal Slider is ready, ', 'active slide: ' + activeSlide + ', ', 'total slides: ' + totalSlides);
    }
  });
});
