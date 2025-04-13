Funcion
    document.querySelector(".down-arrow").addEventListener("click", () => {
        window.scrollBy({
            top: window.innerHeight,
            behavior: "smooth"
        });
    });

