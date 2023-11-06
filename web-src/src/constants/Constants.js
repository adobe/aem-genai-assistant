/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

const MOCK_VARIATIONS = [
  {
    id: 1,
    content: 'Greetings from the digital realm! As software engineers, we craft the virtual world with lines of code and algorithms, shaping the future one byte at a time.',
    isFavorite: false,
  },
  {
    id: 2,
    content: 'Salutations, fellow programmers! In the ever-expanding universe of technology, our code serves as the stars illuminating the path to innovation and progress.',
    isFavorite: false,
  },
  {
    id: 3,
    content: 'Code, conquer, and create! With each keystroke, we unlock the potential of the digital domain, bringing ideas to life and solving complex problems with elegance and precision.',
    isFavorite: false,
  },
  {
    id: 4,
    content: 'Software engineering magic at your service! Our spells are written in C++, Python, and JavaScript, transforming dreams into reality and bugs into oblivion.',
    isFavorite: false,
  },
  {
    id: 5,
    content: 'May your code compile flawlessly! As we navigate the labyrinth of programming, let our algorithms be optimized, and our syntax be error-free. Happy coding!',
    isFavorite: false,
  },
  {
    id: 6,
    content: 'Hello, fellow code wranglers! With our keyboards as lassos, we tame the digital frontier, creating innovative solutions and embracing the wild world of software.',
    isFavorite: false,
  },
  {
    id: 7,
    content: 'Greetings, code sorcerers! Our code incantations breathe life into machines, conjuring software solutions from the depths of logic and creativity.',
    isFavorite: false,
  },
  {
    id: 8,
    content: 'Hey there, tech virtuosos! In this symphony of 1s and 0s, we are the composers, crafting software masterpieces that resonate with functionality and elegance.',
    isFavorite: false,
  },
  {
    id: 9,
    content: 'Hello from the world of coding! We are the architects of the virtual universe, building structures of data and logic that shape the modern digital landscape.',
    isFavorite: false,
  },
  {
    id: 10,
    content: 'Salutations, code architects! With our keystrokes, we design the blueprints of the digital age, constructing solutions that stand the test of time and technology.',
    isFavorite: false,
  },
];

const MOCK_MIXED_VARIATIONS = [
  {
    id: 11,
    content: `[
      {
        "Title": "Tech Trends Unveiled",
        "Body": "Discover the latest advancements in technology",
        "Button": "Explore Now"
    },
    {
        "Title": "Innovation at Your Fingertips",
        "Body": "Stay ahead with the newest tech trends",
        "Button": "Dive In Today"
      }
  ]`,
    isFavorite: false,
  },
  {
    id: 12,
    content: `[
      {
      "Segment": "free-lapsed-paid-illustrator",
      "Title": "Design Precisely, Impactfully",
      "Body": "Renew your Illustrator subscription, for precise and influential designs.",
      "Reasoning": "Aims to emphasize the influence users can have with their designs upon renewing."
      }
    ]`,
    isFavorite: false,
  },
  {
    id: 13,
    content: 'Greetings, tech visionaries! In a world of 010101, we decipher the language of innovation and transformation, crafting software that shapes the future.',
    isFavorite: false,
  },
  {
    id: 14,
    content: 'Salutations, code architects! With each line of code, we construct the digital skyscrapers of tomorrow, reaching new heights of functionality and creativity.',
    isFavorite: false,
  },
  {
    id: 15,
    content: 'Hello, software artisans! We sculpt digital artistry with the chisels of code, transforming abstract concepts into tangible solutions.',
    isFavorite: false,
  },
  {
    id: 16,
    content: 'Greetings, code pioneers! With our compass of logic and creativity, we navigate the vast seas of software development, always charting a course toward excellence.',
    isFavorite: false,
  },
  {
    id: 17,
    content: 'Hello, digital magicians! Our code is the wand that brings magic to the digital world, making the impossible possible through innovation and ingenuity.',
    isFavorite: false,
  },
  {
    id: 18,
    content: 'Salutations, coding virtuosos! In the symphony of software, our orchestration of algorithms and data structures creates harmonious and functional compositions.',
    isFavorite: false,
  },
  {
    id: 19,
    content: 'Greetings from the realm of software! We are the architects of the virtual kingdom, constructing digital fortresses of code and logic that stand the test of time.',
    isFavorite: false,
  },
  {
    id: 20,
    content: 'Hello, code explorers! With our code compass in hand, we journey through the vast landscapes of programming, discovering new solutions and conquering challenges along the way.',
    isFavorite: false,
  },
];

const LOCAL_STORAGE_KEY = 'favorite-variations';

export { MOCK_VARIATIONS, MOCK_MIXED_VARIATIONS, LOCAL_STORAGE_KEY };
