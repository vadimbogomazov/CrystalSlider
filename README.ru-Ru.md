# Crystal Slider

Языки руководства: [English](README.md), [Русский](README.ru-Ru.md)

## Особенности

- легкий слайдер с минимально необходимым функционалом, написанный на чистом JS;
- без зависимостей;
- респонсив;
- поддержка тач устройств;
- прост в использовании;

## Установка

### Создайте HTML разметку

Создайте элемент `<div class="crystal-slider">` и элемент `<div>` внутри для каждого слайда:

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

### Подключите файлы плагина

Подключите файлы `crystalslider.css` и `crystalslider.min.js`:

```html
<link rel="stylesheet" href="css/crystalslider.css">
<script src="js/crystalslider.min.js">
```

CSS слайдера разделен на стили, необходимые для корректной работы плагина, и стили базовой темы (опционально).

### Вызовите плагин

И последний шаг — вызовите плагин, указав необходимый селектор в опциях:

```html
<script>
  const crystalSlider = new CrystalSlider({
    selector: 'your-selector' // .crystal-slider – селектор по умолчанию
  });
</script>
```

## Опции

Слайдер принимает следующие опции:

| Название | Описание | Тип | По умолчанию |
| ------ | ------ | ------ | ------ |
| selector | селектор слайдера | String | .crystal-slider |
| activeSlide | индекс активного слайда | Number | 1 |
| loop | цикличность слайдера | Boolean | true |
| fade | fade режим | Boolean | false |
| duration | продолжительность анимации (в миллисекундах) | Number | 500 |
| draggable | драг слайдов | Boolean | true |
| adaptiveHeight | адаптивная высота | Boolean | false |
| threshold | минимальное смещение указателя для смены слайда (в пикселях) | Number | 30 |
| titles | подписи к слайдам (значения берутся из data-атрибутов слайдов) | Boolean | false |
| keyboard | управление стрелками клавиатуры ← → | Boolean | false |
| easing | функция плавности анимации ([http://easings.net/ru](http://easings.net/ru)) | String | ease-out |
| nav | навигация | Boolean | true |
| navPrevVal | значение кнопки назад | String | Prev |
| navNextVal | значение кнопки вперед | String | Next |
| pagination | пагинация | Boolean | false |
| thumbnails | миниатюры (изображения берутся из data-атрибутов слайдов) | Boolean | false |
| zIndex | z-index слайдов (опция используется в fade режиме) | Number | 98 |
| onReady | callback после инициализации слайдера | Function | |
| beforeChange | callback перед сменой слайда | Function | |
| afterChange | callback после смены слайда | Function | |

## API

| Название | Описание |
| ------ | ------ |
| prevSlide() | переход на предыдущий слайд |
| nextSlide() | переход на следующий слайд |
| goToSlide(index) | переход на слайд с заданным индексом (index {Number}) |
| isEnabledOption(option) | возвращает true, если опция включена (option {String}) |
| destroy() | уничтожает экземпляр слайдера |
| reinit(options) | реинициализация слайдера с новыми опциями (options {Object}) |
| activeSlide | индекс активного слайда (только для чтения) |
| slidesLength | количество слайдов (только для чтения) |

## Дополнительно

- Версия: 1.0.0
- Лицензия: MIT
