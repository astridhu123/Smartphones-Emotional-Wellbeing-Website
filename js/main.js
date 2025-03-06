// Handle dot clicks
dots.forEach(dot => {
    dot.addEventListener('click', () => {
        const slideIndex = parseInt(dot.getAttribute('data-slide')) - 1;
        currentSlideIndex = slideIndex;
        updateSlides();
    });
});
