import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center px-4">
      <h1 className="text-9xl font-bold text-blue-600">404</h1>
      <h2 className="text-3xl font-semibold mt-4 text-gray-800">Ups, te perdiste...</h2>
      <p className="text-gray-600 mt-2 text-lg">
        La página que buscas no existe o ha sido movida.
      </p>
      <Link
        to="/"
        className="mt-8 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 font-medium"
      >
        Volver al Inicio
      </Link>
    </div>
  );
};

export default NotFound;
