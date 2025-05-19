import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const FourOhFourPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-orange-50">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-9xl font-bold text-orange-500">404</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2">
            The page you are looking for doesn't exist or has been moved.
          </p>
        </div>
        <Link to="/" className="btn btn-primary inline-flex items-center">
          <Home size={18} className="mr-2" />
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default FourOhFourPage;