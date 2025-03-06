let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

// Function to go to the next slide
function goToNextSlide() {
    if (currentSlideIndex < slides.length - 1) {
        currentSlideIndex++;
        updateSlides();
    }
}

// Function to go to the previous slide
function goToPreviousSlide() {
    if (currentSlideIndex > 0) {
        currentSlideIndex--;
        updateSlides();
    }
}

// Update slide visibility and active dots
function updateSlides() {
    slides.forEach((slide, index) => {
        if (index === currentSlideIndex) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, index) => {
        if (index === currentSlideIndex) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Initialize first slide
updateSlides();

// Flag to prevent multiple scroll actions in rapid succession
let isScrolling = false;

// Event listeners for scroll
window.addEventListener('wheel', (event) => {
    if (isScrolling) return; // Prevent scrolling if already scrolling

    // Prevent default scroll behavior
    event.preventDefault();

    // Determine the direction of the scroll
    if (event.deltaY > 0) {
        // Scroll down (next slide)
        isScrolling = true;
        goToNextSlide();
    } else if (event.deltaY < 0) {
        // Scroll up (previous slide)
        isScrolling = true;
        goToPreviousSlide();
    }

    // Timeout to re-enable scrolling after the transition is completed
    setTimeout(() => {
        isScrolling = false;
    }, 600); // Adjust the timeout based on your slide transition time
}, { passive: false });