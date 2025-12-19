# ToTheZip Pages

This project includes the following pages based on the Figma design:

## Available Pages

### 1. MainPage (`src/components/MainPage.vue`)
The main landing page featuring:
- Navigation bar with login/signup links
- Banner area
- Advanced search bar with region, options, and property name filters
- Property recommendations section with cards
- News/notice section with preview cards
- Footer with project information

**Usage:**
```vue
<template>
  <MainPage />
</template>

<script>
import MainPage from './components/MainPage.vue';

export default {
  components: { MainPage }
};
</script>
```

### 2. NoticePage (`src/components/NoticePage.vue`)
The dedicated notice/news page featuring:
- Navigation bar with wishlist, calendar, and profile icons
- Compact search bar
- HOT news sidebar with trending articles
- Filterable notice grid (전체/청약/뉴스)
- Footer with project information

**Usage:**
```vue
<template>
  <NoticePage />
</template>

<script>
import NoticePage from './components/NoticePage.vue';

export default {
  components: { NoticePage }
};
</script>
```

## Components Used

### PropertyCard (`src/components/PropertyCard.vue`)
Displays individual property information:
- Property image placeholder
- Star rating badge
- Property name
- Address with map pin icon
- Tags (문세권, 학세권, 병세권)

**Props:**
- `name` (String, required): Property name
- `address` (String, required): Property address
- `rating` (String, required): Property rating
- `tags` (Array, default: []): Array of tag strings

### NoticeCard (`src/components/NoticeCard.vue`)
Displays notice/news information:
- Notice type (주요 뉴스)
- Date
- Title
- Arrow icon for navigation

**Props:**
- `type` (String, required): Notice type
- `date` (String, required): Notice date
- `title` (String, required): Notice title

## Design System Colors

The project uses the ToTheZip design system defined in `src/assets/base.css`:

```css
--tothezip-beige-01: #FFF3E9;
--tothezip-gray-02: #DCD4CF;
--tothezip-gray-04: #A3978F;
--tothezip-brown-08: #543525;
--tothezip-orange-06: #FF9C33;
--tothezip-brown-01: #F4ECE7;
--tothezip-ruby-06: #FF4F6E;
--tothezip-brown-02: #E8D3C3;
--tothezip-gray-03: #C0B6AE;
--tothezip-brown-06: #A05730;
--tothezip-beige-08: #936049;
--tothezip-orange-07: #D37D33;
```

## Switching Between Pages

In `src/App.vue`, you can switch between pages by commenting/uncommenting:

```vue
<template>
  <div id="app">
    <!-- Main Page -->
    <MainPage />
    
    <!-- Notice Page (uncomment to use) -->
    <!-- <NoticePage /> -->
  </div>
</template>
```

## Typography

The design uses the **Pretendard** and **Pretendard Variable** font families. Make sure to include these fonts in your project or they will fall back to system fonts.

## Development

Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

## Notes

- All components follow the exact design specifications from the Figma file
- Inline styles have been converted to CSS classes with descriptive names
- The layout is optimized for a 1280px viewport width
- All colors use CSS custom properties from the design system
- Images use placeholder URLs from the design (replace with actual assets)
