import React from 'react';


const StaffAdminLinks = () => {
  // Styles for the background image and font family from the original <body>
  const backgroundStyles = {
    fontFamily: "'Inter', sans-serif",
    backgroundImage: "url('../../public/indianoil_PhotoGrid.png')",
    backgroundSize: 'cover',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    // The rest of the body classes handle the layout: bg-gray-50 min-h-screen flex items-center justify-center p-2
  };

  // Styles for the button container to push it down the page
  const containerMarginStyles = {
    marginTop: '32%',
  };

  return (
    // Outer div takes the place of the <body> and applies the necessary styles/classes
    <div
      className="bg-gray-50 min-h-screen flex items-center justify-center p-2"
      style={backgroundStyles}
    >
      <div
        className="gap-6 w-full max-w-xs sm:max-w-md"
        id="sta"
        style={containerMarginStyles}
      >
        <a
          href="/staff"
          className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition mb-3"
          role="button"
          aria-label="Go to Staff section"
        >
          <i className="fas fa-users mr-3 text-lg"></i> Staff
        </a>
        <a
          href="/login"
          className="flex items-center justify-center w-full sm:w-auto px-8 py-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition"
          role="button"
          aria-label="Go to Admin section"
        >
          <i className="fas fa-user-shield mr-3 text-lg"></i> Admin
        </a>
      </div>
    </div>
  );
};

export default StaffAdminLinks;