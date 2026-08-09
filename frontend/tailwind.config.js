/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'crema-fondo': '#F8F6F0', // El color clarito del fondo
        'verde-epigrafe': '#3B4D36', // El verde oscuro de los botones y el footer
        'texto-principal': '#1A1A1A'
      },
      fontFamily: {
        'serif': ['"Playfair Display"', 'serif'], // Para los títulos
        'sans': ['Montserrat', 'sans-serif'] // Para los textos
      }
    },
  },
  plugins: [],
  
}

