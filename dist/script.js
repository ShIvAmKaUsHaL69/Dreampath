/**
 * DreamRoute Landing Page Scripts
 */

// Initialize Lucide icons
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initScrollReveal();
  initMobileMenu();
  initSmoothScroll();
  initProgressAnimation();
});

/**
 * Scroll reveal animation for elements with .reveal class
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');
  
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally unobserve after reveal
        // observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  revealElements.forEach(el => observer.observe(el));
}

/**
 * Mobile menu toggle
 */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.toggle('open');
      
      // Update icon
      const icon = menuBtn.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
        lucide.createIcons();
      }
    });
    
    // Close menu when clicking a link
    const mobileLinks = mobileMenu.querySelectorAll('.mobile-link');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        const icon = menuBtn.querySelector('i');
        if (icon) {
          icon.setAttribute('data-lucide', 'menu');
          lucide.createIcons();
        }
      });
    });
  }
}

/**
 * Smooth scroll for anchor links
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

/**
 * Animate progress bar in hero card
 */
function initProgressAnimation() {
  const progressFill = document.querySelector('.progress-fill');
  
  if (progressFill) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Trigger the animation by setting the width
          setTimeout(() => {
            progressFill.style.width = '35%';
          }, 500);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    
    // Reset and observe
    progressFill.style.width = '0%';
    observer.observe(progressFill);
  }
}

/**
 * FAQ accordion toggle
 */
function toggleFaq(button) {
  const faqItem = button.closest('.faq-item');
  const allItems = document.querySelectorAll('.faq-item');
  
  // Close other items
  allItems.forEach(item => {
    if (item !== faqItem) {
      item.classList.remove('open');
    }
  });
  
  // Toggle current item
  faqItem.classList.toggle('open');
}

/**
 * Add scroll effect to nav
 */
let lastScrollTop = 0;
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  
  if (scrollTop > 100) {
    nav.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
    nav.style.borderBottom = '1px solid var(--border)';
  } else {
    nav.style.boxShadow = 'none';
    nav.style.borderBottom = 'none';
  }
  
  lastScrollTop = scrollTop;
}, { passive: true });

/**
 * Counter animation for stats (optional enhancement)
 */
function animateCounter(element, target, duration = 2000) {
  let start = 0;
  const increment = target / (duration / 16);
  
  function updateCounter() {
    start += increment;
    if (start < target) {
      element.textContent = Math.floor(start).toLocaleString() + '+';
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target.toLocaleString() + '+';
    }
  }
  
  updateCounter();
}

// Initialize counters when they come into view
const statsSection = document.querySelector('.stats-section');
if (statsSection) {
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stats are already displayed, this is just for potential counter animation
        statsObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  statsObserver.observe(statsSection);
}
