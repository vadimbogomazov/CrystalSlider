# Crystal SLider

## Особенности

- легкий JavaScript слайдер с минимально необходимым функционалом;
- без зависимостей;
- адаптивный;
- поддержка touch-устройств:

## Как установить

Базовая разметка HTML в документе:

```sh
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

CSS слайдера разделен на стили, необходимые для работы плагина, и базовую тему. Просто подключите файл crystalslider.css в ваш документ:

```sh
<link rel="stylesheet" href="css/crystalslider.css">
```

Инициализация плагина:

```sh
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
| draggable | активация/деактивация драга | Boolean | true |
| threshold | минимальное смещение указателя для смены слайда | Number | 30 |
| keyboard | управление стрелками клавиатуры | Boolean | false |
| easing | функция анимации | String | ease-out |
| nav | навигация | Boolean | true |
| navPrevVal | текст кнопки назад | String | Prev |
| navNextVal | текст кнопки вперед | String | Next |
| pagination | пагинация | Boolean | true |
| onReady | callback после инициализации слайдера | Function | |
| beforeChange | callback перед сменой слайда | Function | |
| afterChange | callback после смены слайда | Function | |

## API

| ------ | ------ |
| prevSlide() | предыдущий слайд |
| nextSlide() | следующий слайд |
| goToSlide(index) | переход на слайд с заданным индексом |
| activeSlide | индекс активного слайда |
| slidesCount | Количество слайдов |

## Дополнительно

Лицензия: MIT