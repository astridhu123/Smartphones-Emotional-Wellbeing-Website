let currentSlideIndex = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');
let isScrolling = false;

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
        slide.classList.toggle('active', index === currentSlideIndex);
    });

    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlideIndex);
    });
}

function changeSlide(direction) {
    if (isScrolling) return;

    let newIndex = currentSlideIndex + direction;
    if (newIndex >= 0 && newIndex < slides.length) {
        currentSlideIndex = newIndex;
        updateSlides();
        isScrolling = true;

        setTimeout(() => {
            isScrolling = false;
        }, 700);
    }
}
window.addEventListener('wheel', (event) => {
    if (isScrolling) return;

    event.preventDefault(); // Stop normal scrolling
    changeSlide(event.deltaY > 0 ? 1 : -1); // Detect direction
}, { passive: false });

// Handle dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        if (!isScrolling && index !== currentSlideIndex) {
            currentSlideIndex = index;
            updateSlides();
        }
    });
});

// Initialize slides
updateSlides();