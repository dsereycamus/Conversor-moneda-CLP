// Obtener referencias a los elementos del DOM
const clpInput = document.getElementById("clpInput");
const selectMonedas = document.getElementById("selectMonedas");
const form = document.getElementById("form");
const result = document.getElementById("result");
const chartDOM = document.getElementById("myChart");
let myChart;

// Función asincrónica para obtener la tasa de cambio de la moneda que selecciono
const getMonedas = async () => {
  try {
    // Realiza solicitud a la API para obtener los datos de la moneda que escojo
    const res = await fetch(`https://mindicador.cl/api/${selectMonedas.value}`);
    const data = await res.json();

    // Verificar si la solicitud fue exitosa o no
    if (!res.ok) {
      throw new Error("Error en la petición solicitada");
    }

    // Extrae valor de la moneda seleccionada y calcula el equivalente en CLP
    const valorMoneda = +data.serie[0].valor;
    const exchange = +(clpInput.value / valorMoneda);

    // Muestae resultado en el elemento result del DOM
    result.textContent = `$ ${exchange.toLocaleString()}`;

    // Devuelve los datos obtenidos
    return data;
  } catch (err) {
    // Manejar errores y mostrar mensajes en el elemento result del DOM
    result.textContent = err;
  }
};

// Función asincrónica para la configuración del gráfico
const prepareChart = async (monedas) => {
  // Extrae fechas y valores de las monedas para el eje X e Y del gráfico
  const ejeX = monedas.serie.map((item) => {
    return item.fecha.slice(0, 10);
  });
  const maxEjeX = ejeX.slice(0, 10);

  const ejeY = monedas.serie.map((item) => {
    return item.valor;
  });

  const maxEjeY = ejeY.slice(0, 10);

  // Configuración del gráfico
  const config = {
    type: "line",
    data: {
      labels: maxEjeX.reverse(),
      datasets: [
        {
          label: `${selectMonedas.value}`,
          backgroundColor: "#084a9e",
          data: maxEjeY.reverse(),
        },
      ],
    },
  };

  // Devuelve la configuración del gráfico
  return config;
};

// Función para renderizar el gráfico en el elemento chartDOM del DOM
async function renderChart() {
  // Elimina el gráfico existente si es que ya hay uno
  if (myChart) {
    myChart.destroy();
  }
  // Obtiene datos de la moneda seleccionada y configuración del gráfico
  const monedas = await getMonedas();
  const config = await prepareChart(monedas);

  // Crear un nuevo gráfico y asignarlo a la variable myChart
  myChart = new Chart(chartDOM, config);
}

// Agrega un event listener al formulario para manejar la subida de datos
form.addEventListener("submit", (e) => {
  // Evita el comportamiento por defecto del formulario
  e.preventDefault();

  // Valida que los campos no estén vacíos
  if (clpInput.value == 0 || selectMonedas.value == "") {
    alert("Debes rellenar los campos solicitados");
  } else {
    // Obtiene datos de la moneda y renderiza el gráfico
    getMonedas();
    renderChart();
  }
});
