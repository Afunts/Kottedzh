// assets/js/data.js
(function () {
  // Правила цены (настраивается)
  // weekendDays: 0=Вс ... 6=Сб
  // Обычно наценка на Пт/Сб ночи -> [5,6]
  window.PRICE_RULES = {
    weekendDays: [5, 6],
    weekendMultiplier: 1.2, // +20% на выходные ночи

    // Сезоны: [start, end) — end не включительно
    seasons: [
      { name: "Низкий сезон", start: "2026-01-10", end: "2026-03-01", multiplier: 0.9 },
      { name: "Высокий сезон", start: "2026-06-01", end: "2026-09-01", multiplier: 1.3 },
      { name: "Новогодние", start: "2025-12-20", end: "2026-01-10", multiplier: 1.6 }
    ]
  };

  // Домики + занятые даты
  // bookings: интервалы [start, end) — end не включительно
  window.HOUSES = [
    {
      id: "alpine",
      type: "chalet",
      title: "Альпийский шале",
      subtitle: "Камин, панорама, терраса",
      desc: "Просторный дом с камином и видом на вершины. Панорамные окна, тёплая гостиная и терраса.",
      guests: 6,
      area: 90,
      bedrooms: 2,
      baths: 1,
      price: 15500,
      tags: ["панорама", "камин", "кухня", "терраса", "Wi-Fi"],
      amenities: ["Камин", "Полностью оборудованная кухня", "Wi-Fi", "Парковка", "Мангал"],
      images: [
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1542718610-a1d656d1884c?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1501183638710-841dd1904471?auto=format&fit=crop&w=2000&q=80"
      ],
      bookings: [
        ["2026-03-01", "2026-03-04"],
        ["2026-03-10", "2026-03-12"],
        ["2026-03-20", "2026-03-25"]
      ]
    },
    {
      id: "dome",
      type: "dome",
      title: "Звёздный купол",
      subtitle: "Прозрачная крыша, глэмпинг",
      desc: "Глэмпинг с прозрачной крышей: идеально для романтических вечеров и наблюдения за небом.",
      guests: 3,
      area: 35,
      bedrooms: 1,
      baths: 1,
      price: 8500,
      tags: ["прозрачная крыша", "обогрев", "мангал", "Wi-Fi"],
      amenities: ["Панорамная/прозрачная крыша", "Обогрев", "Wi-Fi", "Парковка"],
      images: [
        "https://images.unsplash.com/photo-1520962917968-5f8bd833b26c?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=2000&q=80"
      ],
      bookings: [
        ["2026-03-05", "2026-03-07"],
        ["2026-03-15", "2026-03-18"]
      ]
    },
    {
      id: "river",
      type: "river",
      title: "Дом над рекой",
      subtitle: "Терраса на сваях, вид на воду",
      desc: "Терраса на сваях, панорамный вид на воду и горы. Тихое место для перезагрузки.",
      guests: 4,
      area: 60,
      bedrooms: 2,
      baths: 1,
      price: 11000,
      tags: ["вид на реку", "терраса", "кухня", "парковка", "Wi-Fi"],
      amenities: ["Вид на реку", "Терраса", "Кухня", "Wi-Fi", "Парковка"],
      images: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=2000&q=80",
        "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?auto=format&fit=crop&w=2000&q=80"
      ],
      bookings: [
        ["2026-03-02", "2026-03-03"],
        ["2026-03-22", "2026-03-24"],
        ["2026-03-28", "2026-03-31"]
      ]
    }
  ];
})();