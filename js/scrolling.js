new fullpage('#fullpage', {
    autoScrolling: true,
    scrollHorizontally: true,
    navigation: true,
    verticalCentered: true,
    scrollingSpeed: 800,
    easing: '',
});
document.addEventListener("DOMContentLoaded", function () {
    let observer = new IntersectionObserver(entries => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                let delay = entry.target.classList.contains("late-fact")
                    ? (index * 800) + 2000
                    : index * 2000;

                setTimeout(() => {
                    entry.target.classList.add("visible");
                }, delay);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll(".hidden").forEach((element) => {
        observer.observe(element);
    });
});