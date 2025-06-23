import { storage } from '../../server/storage.js';

export const handler = async (event, context) => {
  const { httpMethod, path, body } = event;
  
  // Handle CORS
  if (httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE'
      },
      body: ''
    };
  }

  try {
    // GET /api/tours/:id
    if (httpMethod === 'GET' && path.includes('/tours/')) {
      const id = parseInt(path.split('/tours/')[1]);
      const tour = await storage.getTour(id);
      
      if (!tour) {
        return {
          statusCode: 404,
          headers: { 'Access-Control-Allow-Origin': '*' },
          body: JSON.stringify({ message: "Tour not found" })
        };
      }
      
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(tour)
      };
    }

    // POST /api/tours
    if (httpMethod === 'POST' && path.endsWith('/tours')) {
      const tourData = JSON.parse(body);
      const tour = await storage.createTour(tourData);
      
      return {
        statusCode: 201,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify(tour)
      };
    }

    return {
      statusCode: 404,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: "Not found" })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: "Internal server error" })
    };
  }
};