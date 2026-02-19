# Width Toggle Feature - Development Documentation

## 🎯 ISSUE DESCRIPTION

The floating header width toggle feature is implemented but has the following problems:

### Current Issues:
1. **Menu Overlap**: The floating header overlaps with the website menu (z-index issue)
   - Expected: Menu should display above/behind the floating header OR header should be hidden when at top
   - Actual: Header covers menu items even when not scrolled

2. **Button Functionality Broken**: Width buttons don't change the article/book content width
   - Expected: Clicking buttons should change `.container-article` or `.container-wide` max-width
   - Actual: Only changes the floating header width, not the content width
   - Possible cause: DOM selector not finding the container, or CSS not overriding existing max-width

3. **Inconsistent Width Application**: Header width changes but content width doesn't
   - Expected: Both header and content should resize together
   - Actual: Only header resizes when buttons clicked

### Previous Implementation Notes:
- Feature was supposed to only show header when scrolled 300px down (not at page top)
- Before implementing scroll-based behavior, menu was getting hidden properly
- Need to ensure: Header hides at top → no overlap with menu

## 📋 CURRENT FILE CONTENTS

### 1. `/src/components/WidthToggle.astro`

```astro
---
interface Props {
  title: string;
  author?: string;
  lang: 'fa' | 'en';
}

const { title, author = '', lang } = Astro.props;
const isArabic = lang === 'fa';
---

<header
  class="floating-header"
  id="width-toggle-header"
  style="display: none;"
>
  <div class="floating-header-content">
    <!-- Info Section -->
    <div class="header-info">
      <h2 class="header-title">{title}</h2>
      {author && <p class="header-author">{author}</p>}
    </div>

    <!-- Width Options -->
    <div class="width-options">
      <button
        class="width-btn"
        data-width="default"
        title={isArabic ? 'عرض عادی (896px)' : 'Default (896px)'}
      >
        <span>۸۹۶</span>
      </button>
      <button
        class="width-btn"
        data-width="1024"
        title={isArabic ? '1024px' : '1024px'}
      >
        <span>۱۰۲۴</span>
      </button>
      <button
        class="width-btn"
        data-width="1280"
        title={isArabic ? '1280px' : '1280px'}
      >
        <span>۱۲۸۰</span>
      </button>
      <button
        class="width-btn active"
        data-width="full"
        title={isArabic ? 'تمام عرض' : 'Full Width'}
      >
        <span>🔆</span>
      </button>
    </div>

    <!-- Go to Top Button -->
    <button
      id="go-to-top-btn"
      class="go-to-top-btn"
      title={isArabic ? 'برو به بالا' : 'Go to top'}
      aria-label={isArabic ? 'برو به بالا' : 'Go to top'}
    >
      <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
      </svg>
    </button>
  </div>
</header>

<style>
  .floating-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 30;
    background: linear-gradient(135deg, rgb(26 95 122) 0%, rgb(41 128 185) 100%);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 0.75rem 1rem;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .floating-header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    max-width: 90vw;
    height: auto;
    margin: 0 auto;
    padding: 0 1rem;
  }

  .header-info {
    flex: 1;
    min-width: 0;
  }

  .header-title {
    font-size: 0.875rem;
    font-weight: 600;
    color: white;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .header-author {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .width-options {
    display: flex;
    gap: 0.5rem;
    flex-shrink: 0;
  }

  .width-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 0.75rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 0.375rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .width-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.05);
  }

  .width-btn.active {
    background: rgba(255, 255, 255, 0.3);
    border-color: white;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.3);
  }

  .go-to-top-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.25rem;
    height: 2.25rem;
    padding: 0;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 0.375rem;
    color: white;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .go-to-top-btn:hover {
    background: rgba(255, 255, 255, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
    transform: scale(1.1);
  }

  @media (max-width: 768px) {
    .floating-header {
      padding: 0.5rem;
    }

    .floating-header-content {
      gap: 0.5rem;
    }

    .header-title {
      font-size: 0.75rem;
    }

    .header-author {
      font-size: 0.625rem;
    }

    .width-btn {
      padding: 0.375rem 0.5rem;
      font-size: 0.65rem;
    }

    .go-to-top-btn {
      width: 2rem;
      height: 2rem;
    }
  }
</style>

<script is:inline>
  // Width options in pixels
  const WIDTH_OPTIONS = {
    default: 896,    // 56rem
    '1024': 1024,
    '1280': 1280,
    full: null,      // null means 90% of viewport
  };

  function initWidthToggle() {
    console.log('🔍 Initializing Width Toggle...');
    const header = document.getElementById('width-toggle-header');
    const widthBtns = document.querySelectorAll('.width-btn');
    const goToTopBtn = document.getElementById('go-to-top-btn');
    
    // Try multiple selectors
    let container = document.querySelector('article.container-article');
    if (!container) {
      container = document.querySelector('.container-article');
    }
    if (!container) {
      container = document.querySelector('.container-wide');
    }

    console.log('✅ Header found:', !!header);
    console.log('✅ Buttons found:', widthBtns.length);
    console.log('✅ Container found:', !!container);
    if (container) {
      console.log('Container DOM:', container.outerHTML.substring(0, 200));
      console.log('Container element:', container.tagName, container.className);
      console.log('Container style.maxWidth before:', container.style.maxWidth);
      console.log('Container computed max-width before:', window.getComputedStyle(container).maxWidth);
      console.log('Parent element:', container.parentElement?.tagName, container.parentElement?.className);
      if (container.parentElement) {
        console.log('Parent computed max-width:', window.getComputedStyle(container.parentElement).maxWidth);
      }
    }

    if (!header || !container) {
      console.error('❌ INITIALIZATION FAILED - elements not found');
      return;
    }

    // Load saved width from localStorage
    const savedWidth = localStorage.getItem('content-width') || 'full';
    console.log('📂 Saved width in localStorage:', savedWidth);
    applyWidth(savedWidth);
    updateButtonStates(savedWidth);

    // Show/hide header on scroll
    let ticking = false;

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY;

          if (scrollY > 300) {
            if (header.style.display !== 'block') {
              header.style.display = 'block';
            }
          } else {
            if (header.style.display !== 'none') {
              header.style.display = 'none';
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    });

    // Width button click handlers
    widthBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const width = btn.getAttribute('data-width');
        console.log('👆 BUTTON CLICKED - requested width:', width);
        applyWidth(width);
        updateButtonStates(width);
        localStorage.setItem('content-width', width);
        console.log(`✅ Width change saved to localStorage: ${width}`);
      });
    });

    // Go to top button
    goToTopBtn?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    function applyWidth(width) {
      const pixelWidth = WIDTH_OPTIONS[width] || null;
      console.log(`\n🔧 APPLYING WIDTH SET: width="${width}", pixels="${pixelWidth}"`);
      console.log('Before changes:');
      console.log('  - container.style.maxWidth:', container.style.maxWidth);
      console.log('  - computed maxWidth:', window.getComputedStyle(container).maxWidth);

      if (pixelWidth === null) {
        // Full width: 90% of viewport
        container.style.setProperty('max-width', '90vw', 'important');
        container.style.setProperty('width', '100%', 'important');
        console.log('Setting to FULL WIDTH (90vw)');
      } else {
        // Fixed width in pixels
        container.style.setProperty('max-width', `${pixelWidth}px`, 'important');
        container.style.setProperty('width', `${pixelWidth}px`, 'important');
        console.log(`Setting to FIXED WIDTH (${pixelWidth}px)`);
      }

      document.documentElement.setAttribute('data-content-width', width);
      
      console.log('After changes:');
      console.log('  - container.style.maxWidth:', container.style.maxWidth);
      console.log('  - computed maxWidth:', window.getComputedStyle(container).maxWidth);
      console.log('  - HTML data-content-width:', document.documentElement.getAttribute('data-content-width'));
      
      // Update header width to match content
      updateHeaderWidth(pixelWidth);
      console.log('✅ Width change applied\n');
    }

    function updateButtonStates(activeWidth) {
      widthBtns.forEach((btn) => {
        if (btn.getAttribute('data-width') === activeWidth) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    function updateHeaderWidth(pixelWidth) {
      const headerContent = header.querySelector('.floating-header-content');
      if (pixelWidth === null) {
        headerContent.style.setProperty('max-width', '90vw', 'important');
      } else {
        headerContent.style.setProperty('max-width', `${pixelWidth}px`, 'important');
      }
      headerContent.style.margin = '0 auto';
      headerContent.style.paddingLeft = '1rem';
      headerContent.style.paddingRight = '1rem';
    }

    console.log('✅ Width Toggle FULLY INITIALIZED - Ready for commands\n');
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidthToggle);
  } else {
    initWidthToggle();
  }

  // Also initialize on astro:after-swap (for view transitions)
  document.addEventListener('astro:after-swap', initWidthToggle);
</script>
```

### 2. `/src/styles/global.css` (Lines 580-635)

```css
/* Full-width layout styles */
@layer components {
  /* Container for articles and books */
  .container-article,
  .container-wide {
    @apply mx-auto px-4 md:px-6 lg:px-8;
    max-width: 56rem; /* 896px - default */
    transition: max-width 0.3s ease-in-out;
  }

  /* Width options */
  html[data-content-width="default"] .container-article,
  html[data-content-width="default"] .container-wide {
    max-width: 56rem; /* 896px */
  }

  html[data-content-width="1024"] .container-article,
  html[data-content-width="1024"] .container-wide {
    max-width: 1024px;
  }

  html[data-content-width="1280"] .container-article,
  html[data-content-width="1280"] .container-wide {
    max-width: 1280px;
  }

  html[data-content-width="full"] .container-article,
  html[data-content-width="full"] .container-wide {
    max-width: 90vw;
  }

  /* Legacy support for binary toggle */
  @media (min-width: 1024px) {
    html[data-full-width="true"] .container-article,
    html[data-full-width="true"] .container-wide {
      max-width: 90%;
    }
  }

  /* Content with floating header */
  .content-with-header {
    margin-top: 0; /* No offset needed - header only shows on scroll */
  }

  /* Adjust scroll padding when header is present */
  html {
    scroll-padding-top: 0;
  }

  @media (max-width: 1023px) {
    /* Hide width toggle on screens smaller than lg */
    #width-toggle-header {
      display: none !important;
    }
  }
}
```

### 3. `/src/layouts/ArticleLayout.astro` (Relevant Lines)

```astro
import WidthToggle from '../components/WidthToggle.astro';

// ... in the JSX:

<BaseLayout title={title} description={description}>
  <ReadingProgress />
  
  <!-- Sticky Width Toggle Header -->
  <WidthToggle title={title} author={author} lang={lang} />

  <article class="content-with-header container-article py-10">
    <!-- Content -->
  </article>
</BaseLayout>
```

### 4. `/src/layouts/BookLayout.astro` (Relevant Lines)

```astro
import WidthToggle from '../components/WidthToggle.astro';

// ... in the JSX:

<BaseLayout title={title} description={description}>
  <ReadingProgress />

  <!-- Sticky Width Toggle Header -->
  <WidthToggle title={title} author={author} lang={lang} />

  <div class="content-with-header container-wide py-10">
    <!-- Content -->
  </div>
</BaseLayout>
```

## 🔍 DEBUGGING STEPS TO VERIFY

When testing:
1. Open browser DevTools Console (F12)
2. Load an article page
3. Scroll down 300px to see if header appears
4. Click width buttons and check console for:
   - `👆 BUTTON CLICKED` messages
   - `🔧 APPLYING WIDTH SET` with before/after values
   - Container width changes in computed styles

## ✅ EXPECTED BEHAVIOR

- **Header hidden at top** (no menu overlap)
- **Header visible when scrolled 300px+**
- **Width buttons change article/book content width**
- **Selected width saved to localStorage** and persists on page reload 
- **4 width options**: default (896px), 1024px, 1280px, full (90vw) [if possible be semantically more meaningful or icons to represent the width size]
- **Header width matches selected content width**
- **Go to top button** scrolls page to top smoothly (Icon changes to a Arrow toward top or similar)
