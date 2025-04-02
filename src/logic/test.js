const handleTest = () => {
    const quizContainer = document.getElementById('quiz-container');
    const resultContainer = document.getElementById('result-container');
    const submitBtn = document.getElementById('submit-btn');
    const restartBtn = document.getElementById('restart-btn');
    const resultLevel = document.getElementById('result-level');
    const resultDescription = document.getElementById('result-description');
    const errorMessage = document.getElementById('error-message');
    const answerInput = document.getElementById('answer-input');
    
    submitBtn.addEventListener('click', function() {
      const userAnswer = answerInput.value.trim();
      
      //Manejo de errores, validando la respuesta
      if (!userAnswer) {
        errorMessage.textContent = 'Por favor ingresa tu respuesta';
        errorMessage.style.display = 'block';
        return;
      }
      
      if (isNaN(userAnswer)) {
        errorMessage.textContent = 'Por favor ingresa un número válido';
        errorMessage.style.display = 'block';
        return;
      }
      
      errorMessage.style.display = 'none';
      const answerNum = parseInt(userAnswer, 10);
      
      // Medir el nivel de lógica
      let level = '';
      let description = '';
      
      if (answerNum === 42) {
        level = 'Alto';
        description = '¡Correcto! Has identificado que la secuencia sigue el patrón de "sumar números impares consecutivos" (+4, +6, +8, +10, +12), lo que demuestra una excelente capacidad de análisis de patrones.';
      } 
      else if (answerNum >= 40 && answerNum <= 44) {
        level = 'Medio';
        
        if (answerNum === 40) {
          description = 'Casi correcto. Parece que aplicaste un patrón simple de "sumar 10" al último número. La secuencia sigue un patrón más complejo.';
        } 
        else if (answerNum === 44) {
          description = 'Casi correcto. Has analizado la secuencia a un nivel más profundo, considerando las diferencias entre diferencias, pero la respuesta precisa es 42.';
        } 
        else {
          description = 'Estás cerca de la respuesta correcta. La secuencia sigue un patrón de sumar números impares consecutivos (+4, +6, +8, +10, +12).';
        }
      }
      else if (answerNum >= 36 && answerNum < 40) {
        level = 'Bajo';
        description = 'Has identificado que hay un incremento en la secuencia, pero no has encontrado el patrón correcto. La secuencia suma números impares consecutivos.';
      }
      else if (answerNum > 44 && answerNum <= 50) {
        level = 'Medio';
        description = 'Has notado que la secuencia aumenta, pero el incremento es mayor de lo necesario. El patrón suma números impares consecutivos (+4, +6, +8, +10, +12).';
      }
      else {
        level = 'Muy Bajo';
        description = 'Tu respuesta está bastante lejos del patrón correcto. La secuencia suma números impares consecutivos (+4, +6, +8, +10, +12).';
      }
      
      resultLevel.textContent = 'Nivel: ' + level;
      resultDescription.textContent = description;
      
      quizContainer.style.display = 'none';
      resultContainer.style.display = 'block';
    });
    
    // Reinicia el test
    restartBtn.addEventListener('click', function() {
      answerInput.value = '';
      
      resultContainer.style.display = 'none';
      quizContainer.style.display = 'block';
      
      errorMessage.style.display = 'none';
    });
    
    answerInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        submitBtn.click();
      }
    });
  };
  
  export default handleTest;

// html de ejemplo para el test

    //   <div id="quiz-container">
    //   <h2>Test de Razonamiento Lógico</h2>
    //   <p>Completa la secuencia: 2, 6, 12, 20, 30, ?</p>
    
    //   <div class="form-group">
    //     <label for="answer-input">Tu respuesta:</label>
    //     <input type="number" id="answer-input" placeholder="Escribe tu respuesta aquí">
    //   </div>
    
    //   <p id="error-message" style="color: red; display: none;"></p>
    
    //   <button id="submit-btn">Enviar respuesta</button>
    // </div>

    // <div id="result-container" style="display: none;">
    //   <h2>Resultado</h2>
    //   <p id="result-level"></p>
    //   <p id="result-description"></p>
    //   <button id="restart-btn">Realizar test nuevamente</button>
    // </div>

    // <script>
    //   // Importar el script en Astro
    //   import handleTest from './test-logica.js';
    //   handleTest();
    // </script>