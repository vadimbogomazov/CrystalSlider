document.addEventListener('DOMContentLoaded', function () {
  var crystalSlider = new CrystalSlider({
    adaptiveHeight: true,
    keyboard: true,
    pagination: true,
    titles: true,
    autoplay: true,

    beforeChange: function(crystalSlider, activeSlide, nextSlide, totalSlides) {
      console.log('Before change slider, ', 'active slide – ' + activeSlide, ', next slide - ' + nextSlide, ', total slides – ' + totalSlides);
    },
    afterChange: function(crystalSlider, activeSlide, totalSlides) {
        console.log('After change slider, ', 'active slide – ' + activeSlide, ', total slides – ' + totalSlides);
    },
    onReady: function(crystalSlider, activeSlide, totalSlides) {
        console.log('Slider is ready, ', 'active slide – ' + activeSlide, ', total slides – ' + totalSlides);
    }
  });
});
