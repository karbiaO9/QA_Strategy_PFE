// BigInt Serialization Middleware for Fastify
// This middleware automatically converts BigInt values to regular numbers
// to prevent JSON serialization errors

function serializeBigInts(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (typeof obj === 'bigint') {
    return Number(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(serializeBigInts);
  }
  
  if (typeof obj === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = serializeBigInts(value);
    }
    return result;
  }
  
  return obj;
}

// Fastify plugin for BigInt serialization
async function bigIntSerializerPlugin(fastify, options) {
  // Add hook to serialize BigInts before sending response
  fastify.addHook('onSend', async (request, reply, payload) => {
    if (payload) {
      try {
        // Parse the payload if it's a string
        const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
        
        // Serialize BigInts
        const serializedData = serializeBigInts(data);
        
        // Return the serialized data as JSON string
        return JSON.stringify(serializedData);
      } catch (error) {
        // If parsing fails, return original payload
        console.error('Error serializing BigInts:', error);
        return payload;
      }
    }
    return payload;
  });
}

// Export both the utility function and Fastify plugin
module.exports = {
  serializeBigInts,
  bigIntSerializerPlugin,
  
  // Legacy compatibility (for existing code)
  bigIntSerializer: bigIntSerializerPlugin
};
