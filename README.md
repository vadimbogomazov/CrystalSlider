# Crystal SLider

##### Особенности

- легкий JavaScript слайдер с минимально необходимым функционалом;
- без зависимостей;
- адаптивный;
- поддержка touch-устройств:

##### Как установить

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
  const crystalSlider = new CrystalSlider()
</script>
```

##### API

| Методы | Описание |
| ------ | ------ |
| prevSlide() | предыдущий слайд |
| nextSlide() | следующий слайд |
| goToSlide(index) | переход на слайд с заданным индексом |

| Свойства | Описание |
| ------ | ------ |
| activeSlide | индекс активного слайда |
| slidesCount | Количество слайдов |

##### Дополнительно

Лицензия: MIT