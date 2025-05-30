let currentCardIndex = 0;
const totalCards = document.querySelectorAll('.team-card').length;
let isScrolling = false;

// Función para mostrar cards progresivamente
function showCardByIndex(index) {
    const cards = document.querySelectorAll('.team-card');
    
    if (index >= 0 && index < cards.length) {
        cards[index].classList.add('animate-in');
        
        // Scroll automático hacia la nueva card
        const scrollContainer = document.getElementById('developers-scroll');
        const cardWidth = cards[index].offsetWidth + 30; // width + gap
        scrollContainer.scrollTo({
            left: index * cardWidth,
            behavior: 'smooth'
        });
    }
}

// Función para ocultar cards posteriores al índice actual
function hideCardsAfterIndex(index) {
    const cards = document.querySelectorAll('.team-card');
    
    for (let i = index + 1; i < cards.length; i++) {
        cards[i].classList.remove('animate-in');
    }
}

// Intersection Observer para detectar cuando la sección está visible
const observerOptions = {
    threshold: [0, 0.25, 0.5, 0.75, 1],
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const rect = entry.boundingClientRect;
            const windowHeight = window.innerHeight;
            
            // Calcular el progreso del scroll en la sección (0 a 1)
            const sectionTop = rect.top;
            const sectionHeight = rect.height;
            const visibleHeight = Math.min(windowHeight - sectionTop, sectionHeight);
            const scrollProgress = Math.max(0, Math.min(1, visibleHeight / (windowHeight * 0.8)));
            
            // Determinar qué card mostrar basado en el progreso
            const targetIndex = Math.floor(scrollProgress * totalCards);
            
            if (targetIndex !== currentCardIndex) {
                currentCardIndex = targetIndex;
                
                // Mostrar cards hasta el índice actual
                for (let i = 0; i <= currentCardIndex; i++) {
                    setTimeout(() => {
                        showCardByIndex(i);
                    }, i * 200);
                }
                
                // Ocultar cards posteriores
                hideCardsAfterIndex(currentCardIndex);
                
                // Actualizar indicador
                updateScrollIndicator();
            }
        } else {
            // Si la sección no está visible, resetear
            currentCardIndex = 0;
            hideCardsAfterIndex(-1);
            updateScrollIndicator();
        }
    });
}, observerOptions);

// Función para actualizar el indicador de scroll
function updateScrollIndicator() {
    const indicator = document.querySelector('.scroll-indicator');
    if (indicator) {
        // Siempre mostrar el indicador para scroll horizontal
        indicator.style.opacity = '1';
        const span = indicator.querySelector('span');
        if (span) {
            span.textContent = `Desliza horizontalmente para ver más`;
        }
    }
}

function showCardByIndex(index) {
const cards = document.querySelectorAll('.team-card');

if (index >= 0 && index < cards.length) {
    cards[index].classList.add('animate-in');
    
    // Scroll automático hacia la nueva tarjeta centrada
    centrarTarjeta(index);
}
}

function centrarTarjeta(index) {
const contenedor = document.getElementById('developers-scroll');
const tarjetas = document.querySelectorAll('.team-card');
const tarjetaObjetivo = tarjetas[index];

const desplazamiento = tarjetaObjetivo.offsetLeft - (contenedor.offsetWidth / 2) + (tarjetaObjetivo.offsetWidth / 2);
contenedor.scrollTo({
    left: desplazamiento,
    behavior: 'smooth'
});
}