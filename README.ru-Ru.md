# Crystal Slider

## Особенности

- легкий JavaScript слайдер с минимально необходимым функционалом;
- без зависимостей;
- респонсив;
- поддержка тач устройств;

## Установка

### Шаг 1

Базовая разметка HTML в документе:

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

### Шаг 2

CSS слайдера разделен на стили, необходимые для работы плагина, и базовую тему. Просто подключите файл crystalslider.css:

```html
<link rel="stylesheet" href="css/crystalslider.css">
```

### Шаг 3

Последний шаг - подключите crystalslider.min.js и вызовите плагин:

```html
<script src="js/crystalslider.min.js"></script>
<script>
  const crystalSlider = new CrystalSlider();
</script>
```

## Опции

Слайдер принимает следующие опции:

| Название | Описание | Тип | По умолчанию |
| ------ | ------ | ------ | ------ |
| selector | селектор слайдера | String | .crystal-slider |
| activeSlide | индекс активного слайда | Number | 1 |
| loop | цикличность слайдера | Boolean | true |
| duration | продолжительность анимации | Number | 500 |
| draggable | включение/отключение драга | Boolean | true |
| adaptiveHeight | включение/отключение адаптивной высоты для слайдера | Boolean | false |
| threshold | минимальное смещение указателя для смены слайда | Number | 30 |
| keyboard | управление стрелками клавиатуры | Boolean | false |
| easing | функция анимации | String | ease-out |
| nav | включение/отключение навигации | Boolean | true |
| navPrevVal | текст кнопки назад | String | Prev |
| navNextVal | текст кнопки вперед | String | Next |
| pagination | включение/отключение пагинации | Boolean | true |
| onReady | callback после инициализации слайдера | Function | |
| beforeChange | callback перед сменой слайда | Function | |
| afterChange | callback после смены слайда | Function | |

## API

| Название | Описание |
| ------ | ------ |
| prevSlide() | предыдущий слайд |
| nextSlide() | следующий слайд |
| goToSlide(index) | переход на слайд с заданным индексом |
| activeSlide | индекс активного слайда |
| slidesCount | количество слайдов |

## Дополнительно

- Версия: 1.0.0
- Лицензия: MIT
